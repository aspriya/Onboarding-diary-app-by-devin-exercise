import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createFeedbackSchema, updateFeedbackSchema, feedbackQuerySchema } from '../validators/feedback';
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

export async function listFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const parsed = feedbackQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid query parameters', formatZodError(parsed.error)));
    }

    const { type, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: req.user.userId, isDeleted: false };
    if (type) where.type = type;

    const [feedback, total] = await Promise.all([
      prisma.feedbackEntry.findMany({ where, skip, take: limit, orderBy: { date: 'desc' } }),
      prisma.feedbackEntry.count({ where }),
    ]);

    res.json({ data: feedback, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function getFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const entry = await prisma.feedbackEntry.findFirst({
      where: { id, isDeleted: false },
    });

    if (!entry) return next(notFoundError('Feedback not found'));
    if (entry.userId !== req.user.userId && req.user.role === 'recruit') {
      return next(forbiddenError());
    }

    res.json({ data: entry });
  } catch (err) {
    next(err);
  }
}

export async function createFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const parsed = createFeedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', formatZodError(parsed.error)));
    }

    const entry = await prisma.feedbackEntry.create({
      data: { ...parsed.data, date: new Date(parsed.data.date), userId: req.user.userId },
    });

    res.status(201).json({ data: entry });
  } catch (err) {
    next(err);
  }
}

export async function updateFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const existing = await prisma.feedbackEntry.findFirst({
      where: { id, userId: req.user.userId, isDeleted: false },
    });
    if (!existing) return next(notFoundError('Feedback not found'));

    const parsed = updateFeedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', formatZodError(parsed.error)));
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.date) updateData.date = new Date(parsed.data.date);

    const entry = await prisma.feedbackEntry.update({
      where: { id },
      data: updateData,
    });

    res.json({ data: entry });
  } catch (err) {
    next(err);
  }
}

export async function deleteFeedback(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const existing = await prisma.feedbackEntry.findFirst({
      where: { id, userId: req.user.userId, isDeleted: false },
    });
    if (!existing) return next(notFoundError('Feedback not found'));

    await prisma.feedbackEntry.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    next(err);
  }
}
