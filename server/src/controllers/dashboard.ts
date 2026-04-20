import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { unauthorizedError } from '../utils/errors';

export async function getDashboardSummary(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const userId = req.user.userId;

    const [
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      totalIssues,
      openIssues,
      resolvedIssues,
      totalFeedback,
      totalNotes,
    ] = await Promise.all([
      prisma.taskEntry.count({ where: { userId, isDeleted: false } }),
      prisma.taskEntry.count({ where: { userId, isDeleted: false, status: 'Completed' } }),
      prisma.taskEntry.count({ where: { userId, isDeleted: false, status: 'InProgress' } }),
      prisma.taskEntry.count({ where: { userId, isDeleted: false, status: 'Blocked' } }),
      prisma.issueEntry.count({ where: { userId, isDeleted: false } }),
      prisma.issueEntry.count({ where: { userId, isDeleted: false, status: 'Open' } }),
      prisma.issueEntry.count({ where: { userId, isDeleted: false, status: 'Resolved' } }),
      prisma.feedbackEntry.count({ where: { userId, isDeleted: false } }),
      prisma.noteEntry.count({ where: { userId, isDeleted: false } }),
    ]);

    res.json({
      data: {
        tasks: { total: totalTasks, completed: completedTasks, inProgress: inProgressTasks, blocked: blockedTasks },
        issues: { total: totalIssues, open: openIssues, resolved: resolvedIssues },
        feedback: { total: totalFeedback },
        notes: { total: totalNotes },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecentActivity(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const userId = req.user.userId;

    const [recentTasks, recentIssues, recentFeedback, recentNotes] = await Promise.all([
      prisma.taskEntry.findMany({
        where: { userId, isDeleted: false },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, title: true, status: true, updatedAt: true },
      }),
      prisma.issueEntry.findMany({
        where: { userId, isDeleted: false },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, title: true, status: true, severity: true, updatedAt: true },
      }),
      prisma.feedbackEntry.findMany({
        where: { userId, isDeleted: false },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, subject: true, type: true, updatedAt: true },
      }),
      prisma.noteEntry.findMany({
        where: { userId, isDeleted: false },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, title: true, tags: true, updatedAt: true },
      }),
    ]);

    const activities = [
      ...recentTasks.map((t) => ({ type: 'task' as const, id: t.id, title: t.title, meta: t.status, updatedAt: t.updatedAt })),
      ...recentIssues.map((i) => ({ type: 'issue' as const, id: i.id, title: i.title, meta: `${i.severity} - ${i.status}`, updatedAt: i.updatedAt })),
      ...recentFeedback.map((f) => ({ type: 'feedback' as const, id: f.id, title: f.subject, meta: f.type, updatedAt: f.updatedAt })),
      ...recentNotes.map((n) => ({ type: 'note' as const, id: n.id, title: n.title, meta: n.tags.join(', '), updatedAt: n.updatedAt })),
    ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 10);

    res.json({ data: activities });
  } catch (err) {
    next(err);
  }
}
