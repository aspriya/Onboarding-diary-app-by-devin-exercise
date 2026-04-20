import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { createNoteSchema, updateNoteSchema, noteQuerySchema } from '../validators/notes';
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

export async function listNotes(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const parsed = noteQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid query parameters', formatZodError(parsed.error)));
    }

    const { tags, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: req.user.userId, isDeleted: false };
    if (tags) {
      where.tags = { hasSome: tags.split(',').map((t: string) => t.trim()) };
    }

    const [notes, total] = await Promise.all([
      prisma.noteEntry.findMany({ where, skip, take: limit, orderBy: { date: 'desc' } }),
      prisma.noteEntry.count({ where }),
    ]);

    res.json({ data: notes, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function getNote(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const note = await prisma.noteEntry.findFirst({
      where: { id, isDeleted: false },
    });

    if (!note) return next(notFoundError('Note not found'));
    if (note.userId !== req.user.userId && req.user.role === 'recruit') {
      return next(forbiddenError());
    }

    res.json({ data: note });
  } catch (err) {
    next(err);
  }
}

export async function createNote(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const parsed = createNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', formatZodError(parsed.error)));
    }

    const note = await prisma.noteEntry.create({
      data: { ...parsed.data, date: new Date(parsed.data.date), userId: req.user.userId },
    });

    res.status(201).json({ data: note });
  } catch (err) {
    next(err);
  }
}

export async function updateNote(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const existing = await prisma.noteEntry.findFirst({
      where: { id, userId: req.user.userId, isDeleted: false },
    });
    if (!existing) return next(notFoundError('Note not found'));

    const parsed = updateNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', formatZodError(parsed.error)));
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.date) updateData.date = new Date(parsed.data.date);

    const note = await prisma.noteEntry.update({
      where: { id },
      data: updateData,
    });

    res.json({ data: note });
  } catch (err) {
    next(err);
  }
}

export async function deleteNote(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const existing = await prisma.noteEntry.findFirst({
      where: { id, userId: req.user.userId, isDeleted: false },
    });
    if (!existing) return next(notFoundError('Note not found'));

    await prisma.noteEntry.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.json({ message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
}
