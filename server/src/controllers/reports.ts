import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { unauthorizedError } from '../utils/errors';

export async function exportTasksCsv(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const userId = req.user.role === 'recruit' ? req.user.userId : (req.query.userId as string) || req.user.userId;

    const tasks = await prisma.taskEntry.findMany({
      where: { userId, isDeleted: false },
      orderBy: { date: 'desc' },
    });

    const header = 'Date,Title,Description,Category,Status,Priority\n';
    const rows = tasks.map((t) =>
      `"${formatDate(t.date)}","${escapeCsv(t.title)}","${escapeCsv(t.description || '')}","${t.category}","${t.status}","${t.priority}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks-report.csv"');
    res.send(header + rows);
  } catch (err) {
    next(err);
  }
}

export async function exportIssuesCsv(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const userId = req.user.role === 'recruit' ? req.user.userId : (req.query.userId as string) || req.user.userId;

    const issues = await prisma.issueEntry.findMany({
      where: { userId, isDeleted: false },
      orderBy: { date: 'desc' },
    });

    const header = 'Date,Title,Description,Severity,Status,Resolution Notes\n';
    const rows = issues.map((i) =>
      `"${formatDate(i.date)}","${escapeCsv(i.title)}","${escapeCsv(i.description)}","${i.severity}","${i.status}","${escapeCsv(i.resolutionNotes || '')}"`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="issues-report.csv"');
    res.send(header + rows);
  } catch (err) {
    next(err);
  }
}

export async function exportFullReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const userId = req.user.role === 'recruit' ? req.user.userId : (req.query.userId as string) || req.user.userId;

    const [user, tasks, issues, feedback, notes] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, department: true, startDate: true } }),
      prisma.taskEntry.findMany({ where: { userId, isDeleted: false }, orderBy: { date: 'desc' } }),
      prisma.issueEntry.findMany({ where: { userId, isDeleted: false }, orderBy: { date: 'desc' } }),
      prisma.feedbackEntry.findMany({ where: { userId, isDeleted: false }, orderBy: { date: 'desc' } }),
      prisma.noteEntry.findMany({ where: { userId, isDeleted: false }, orderBy: { date: 'desc' } }),
    ]);

    res.json({
      data: {
        user,
        generatedAt: new Date().toISOString(),
        tasks: {
          total: tasks.length,
          completed: tasks.filter((t) => t.status === 'Completed').length,
          entries: tasks,
        },
        issues: {
          total: issues.length,
          open: issues.filter((i) => i.status === 'Open').length,
          entries: issues,
        },
        feedback: {
          total: feedback.length,
          entries: feedback,
        },
        notes: {
          total: notes.length,
          entries: notes,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0] ?? d.toISOString();
}

function escapeCsv(str: string): string {
  return str.replace(/"/g, '""');
}
