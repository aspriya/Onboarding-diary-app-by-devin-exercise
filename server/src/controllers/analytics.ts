import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { unauthorizedError } from '../utils/errors';

export async function getTaskStatusBreakdown(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const userId = req.user.role === 'recruit' ? req.user.userId : (req.query.userId as string) || req.user.userId;

    const results = await prisma.taskEntry.groupBy({
      by: ['status'],
      where: { userId, isDeleted: false },
      _count: { id: true },
    });

    const data = results.map((r) => ({ status: r.status, count: r._count.id }));
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getTaskCategoryBreakdown(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const userId = req.user.role === 'recruit' ? req.user.userId : (req.query.userId as string) || req.user.userId;

    const results = await prisma.taskEntry.groupBy({
      by: ['category'],
      where: { userId, isDeleted: false },
      _count: { id: true },
    });

    const data = results.map((r) => ({ category: r.category, count: r._count.id }));
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getIssueSeverityBreakdown(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const userId = req.user.role === 'recruit' ? req.user.userId : (req.query.userId as string) || req.user.userId;

    const results = await prisma.issueEntry.groupBy({
      by: ['severity'],
      where: { userId, isDeleted: false },
      _count: { id: true },
    });

    const data = results.map((r) => ({ severity: r.severity, count: r._count.id }));
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getFeedbackTypeBreakdown(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const userId = req.user.role === 'recruit' ? req.user.userId : (req.query.userId as string) || req.user.userId;

    const results = await prisma.feedbackEntry.groupBy({
      by: ['type'],
      where: { userId, isDeleted: false },
      _count: { id: true },
    });

    const data = results.map((r) => ({ type: r.type, count: r._count.id }));
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getWeeklyProgress(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const userId = req.user.role === 'recruit' ? req.user.userId : (req.query.userId as string) || req.user.userId;

    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const tasks = await prisma.taskEntry.findMany({
      where: { userId, isDeleted: false, date: { gte: fourWeeksAgo } },
      select: { date: true, status: true },
      orderBy: { date: 'asc' },
    });

    const weekMap = new Map<string, { total: number; completed: number }>();
    for (const task of tasks) {
      const weekStart = getWeekStart(task.date);
      const key = weekStart.toISOString().split('T')[0] ?? weekStart.toISOString();
      const existing = weekMap.get(key) || { total: 0, completed: 0 };
      existing.total++;
      if (task.status === 'Completed') existing.completed++;
      weekMap.set(key, existing);
    }

    const data = Array.from(weekMap.entries()).map(([week, counts]) => ({
      week,
      ...counts,
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
