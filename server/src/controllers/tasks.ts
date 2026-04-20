import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../validators/tasks';
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

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const parsed = taskQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid query parameters', formatZodError(parsed.error)));
    }

    const { date, category, status, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: req.user.userId, isDeleted: false };
    if (date) where.date = new Date(date);
    if (category) where.category = category;
    if (status) where.status = status;

    const [tasks, total] = await Promise.all([
      prisma.taskEntry.findMany({ where, skip, take: limit, orderBy: { date: 'desc' } }),
      prisma.taskEntry.count({ where }),
    ]);

    res.json({ data: tasks, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function getTask(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const task = await prisma.taskEntry.findFirst({
      where: { id, isDeleted: false },
    });

    if (!task) return next(notFoundError('Task not found'));
    if (task.userId !== req.user.userId && req.user.role === 'recruit') {
      return next(forbiddenError());
    }

    res.json({ data: task });
  } catch (err) {
    next(err);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', formatZodError(parsed.error)));
    }

    const task = await prisma.taskEntry.create({
      data: { ...parsed.data, date: new Date(parsed.data.date), userId: req.user.userId },
    });

    res.status(201).json({ data: task });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const existing = await prisma.taskEntry.findFirst({
      where: { id, userId: req.user.userId, isDeleted: false },
    });
    if (!existing) return next(notFoundError('Task not found'));

    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', formatZodError(parsed.error)));
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.date) updateData.date = new Date(parsed.data.date);

    const task = await prisma.taskEntry.update({
      where: { id },
      data: updateData,
    });

    res.json({ data: task });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const existing = await prisma.taskEntry.findFirst({
      where: { id, userId: req.user.userId, isDeleted: false },
    });
    if (!existing) return next(notFoundError('Task not found'));

    await prisma.taskEntry.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
}
