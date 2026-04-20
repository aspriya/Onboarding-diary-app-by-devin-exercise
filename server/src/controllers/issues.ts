import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createIssueSchema, updateIssueSchema, issueQuerySchema } from '../validators/issues';
import { AppError, unauthorizedError, notFoundError, forbiddenError } from '../utils/errors';
import { ZodError } from 'zod';

function formatZodError(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!details[path]) details[path] = [];
    details[path].push(issue.message);
  }
  return details;
}

export async function listIssues(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const parsed = issueQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid query parameters', formatZodError(parsed.error)));
    }

    const { status, severity, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: req.user.userId, isDeleted: false };
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const [issues, total] = await Promise.all([
      prisma.issueEntry.findMany({ where, skip, take: limit, orderBy: { date: 'desc' } }),
      prisma.issueEntry.count({ where }),
    ]);

    res.json({ data: issues, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function getIssue(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const issue = await prisma.issueEntry.findFirst({
      where: { id, isDeleted: false },
    });

    if (!issue) return next(notFoundError('Issue not found'));
    if (issue.userId !== req.user.userId && req.user.role === 'recruit') {
      return next(forbiddenError());
    }

    res.json({ data: issue });
  } catch (err) {
    next(err);
  }
}

export async function createIssue(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const parsed = createIssueSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', formatZodError(parsed.error)));
    }

    const issue = await prisma.issueEntry.create({
      data: { ...parsed.data, date: new Date(parsed.data.date), userId: req.user.userId },
    });

    res.status(201).json({ data: issue });
  } catch (err) {
    next(err);
  }
}

export async function updateIssue(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const existing = await prisma.issueEntry.findFirst({
      where: { id, userId: req.user.userId, isDeleted: false },
    });
    if (!existing) return next(notFoundError('Issue not found'));

    const parsed = updateIssueSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', formatZodError(parsed.error)));
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.date) updateData.date = new Date(parsed.data.date);

    const issue = await prisma.issueEntry.update({
      where: { id },
      data: updateData,
    });

    res.json({ data: issue });
  } catch (err) {
    next(err);
  }
}

export async function deleteIssue(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const existing = await prisma.issueEntry.findFirst({
      where: { id, userId: req.user.userId, isDeleted: false },
    });
    if (!existing) return next(notFoundError('Issue not found'));

    await prisma.issueEntry.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: 'Issue deleted' });
  } catch (err) {
    next(err);
  }
}
