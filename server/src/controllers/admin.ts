import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { AppError, unauthorizedError, notFoundError, conflictError } from '../utils/errors';
import { ZodError } from 'zod';
import { createUserSchema, updateUserSchema, userQuerySchema } from '../validators/admin';

function formatZodError(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!details[path]) details[path] = [];
    details[path].push(issue.message);
  }
  return details;
}

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  department: true,
  startDate: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const parsed = userQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Invalid query parameters', formatZodError(parsed.error)));
    }

    const { role, isActive, search, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: userSelect, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);

    res.json({ data: users, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) return next(notFoundError('User not found'));

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const parsed = createUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', formatZodError(parsed.error)));
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) return next(conflictError('Email already in use'));

    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        password: hashedPassword,
        name: parsed.data.name,
        role: parsed.data.role,
        department: parsed.data.department,
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
      },
      select: userSelect,
    });

    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return next(notFoundError('User not found'));

    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', formatZodError(parsed.error)));
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.startDate) updateData.startDate = new Date(parsed.data.startDate);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    if (id === req.user.userId) {
      return next(new AppError(400, 'BAD_REQUEST', 'Cannot deactivate your own account'));
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return next(notFoundError('User not found'));

    await prisma.user.update({ where: { id }, data: { isActive: false } });
    res.json({ message: 'User deactivated' });
  } catch (err) {
    next(err);
  }
}
