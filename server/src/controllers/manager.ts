import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { unauthorizedError } from '../utils/errors';

export async function getRecruits(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const recruits = await prisma.user.findMany({
      where: { role: 'recruit', isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        startDate: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({ data: recruits });
  } catch (err) {
    next(err);
  }
}

export async function getRecruitDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const recruitId = req.params.recruitId as string;

    const recruit = await prisma.user.findFirst({
      where: { id: recruitId, role: 'recruit', isActive: true },
      select: { id: true, name: true, email: true, department: true, startDate: true },
    });

    if (!recruit) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Recruit not found', details: null } });
    }

    const [totalTasks, completedTasks, openIssues, totalFeedback, totalNotes] = await Promise.all([
      prisma.taskEntry.count({ where: { userId: recruitId, isDeleted: false } }),
      prisma.taskEntry.count({ where: { userId: recruitId, isDeleted: false, status: 'Completed' } }),
      prisma.issueEntry.count({ where: { userId: recruitId, isDeleted: false, status: 'Open' } }),
      prisma.feedbackEntry.count({ where: { userId: recruitId, isDeleted: false } }),
      prisma.noteEntry.count({ where: { userId: recruitId, isDeleted: false } }),
    ]);

    res.json({
      data: {
        recruit,
        summary: {
          tasks: { total: totalTasks, completed: completedTasks },
          issues: { open: openIssues },
          feedback: { total: totalFeedback },
          notes: { total: totalNotes },
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
