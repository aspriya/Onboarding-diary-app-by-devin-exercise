import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100),
  role: z.enum(['recruit', 'manager', 'admin']),
  department: z.string().max(100).optional(),
  startDate: z.string().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['recruit', 'manager', 'admin']).optional(),
  department: z.string().max(100).optional(),
  startDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const userQuerySchema = z.object({
  role: z.enum(['recruit', 'manager', 'admin']).optional(),
  isActive: z.preprocess((v) => v === 'true' ? true : v === 'false' ? false : v, z.boolean().optional()),
  search: z.string().optional(),
  page: z.preprocess((v) => Number(v) || 1, z.number().int().min(1)),
  limit: z.preprocess((v) => Number(v) || 20, z.number().int().min(1).max(100)),
});
