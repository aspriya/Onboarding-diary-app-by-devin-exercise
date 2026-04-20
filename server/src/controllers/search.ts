import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { unauthorizedError } from '../utils/errors';

export async function globalSearch(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const q = (req.query.q as string || '').trim();
    const type = req.query.type as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    if (!q) {
      return res.json({ data: [], total: 0, page, limit, totalPages: 0 });
    }

    const userId = req.user.role === 'recruit' ? req.user.userId : (req.query.userId as string || undefined);
    const baseWhere = { isDeleted: false, ...(userId ? { userId } : {}) };
    const containsFilter = { contains: q, mode: 'insensitive' as const };

    interface SearchResult {
      type: string;
      id: string;
      title: string;
      description: string;
      meta: Record<string, string>;
      updatedAt: Date;
    }

    const results: SearchResult[] = [];

    const shouldSearch = (t: string) => !type || type === t;

    if (shouldSearch('task')) {
      const tasks = await prisma.taskEntry.findMany({
        where: { ...baseWhere, OR: [{ title: containsFilter }, { description: containsFilter }] },
        orderBy: { updatedAt: 'desc' },
      });
      for (const t of tasks) {
        results.push({
          type: 'task',
          id: t.id,
          title: t.title,
          description: (t.description ?? '').substring(0, 150),
          meta: { status: t.status, category: t.category },
          updatedAt: t.updatedAt,
        });
      }
    }

    if (shouldSearch('issue')) {
      const issues = await prisma.issueEntry.findMany({
        where: { ...baseWhere, OR: [{ title: containsFilter }, { description: containsFilter }] },
        orderBy: { updatedAt: 'desc' },
      });
      for (const i of issues) {
        results.push({
          type: 'issue',
          id: i.id,
          title: i.title,
          description: i.description.substring(0, 150),
          meta: { severity: i.severity, status: i.status },
          updatedAt: i.updatedAt,
        });
      }
    }

    if (shouldSearch('feedback')) {
      const feedback = await prisma.feedbackEntry.findMany({
        where: { ...baseWhere, OR: [{ subject: containsFilter }, { details: containsFilter }] },
        orderBy: { updatedAt: 'desc' },
      });
      for (const f of feedback) {
        results.push({
          type: 'feedback',
          id: f.id,
          title: f.subject,
          description: f.details.substring(0, 150),
          meta: { type: f.type },
          updatedAt: f.updatedAt,
        });
      }
    }

    if (shouldSearch('note')) {
      const notes = await prisma.noteEntry.findMany({
        where: { ...baseWhere, OR: [{ title: containsFilter }, { content: containsFilter }] },
        orderBy: { updatedAt: 'desc' },
      });
      for (const n of notes) {
        results.push({
          type: 'note',
          id: n.id,
          title: n.title,
          description: (n.content ?? '').substring(0, 150),
          meta: { tags: n.tags.join(', ') },
          updatedAt: n.updatedAt,
        });
      }
    }

    results.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const total = results.length;
    const paged = results.slice(skip, skip + limit);

    res.json({ data: paged, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}
