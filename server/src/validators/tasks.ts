import { z } from 'zod';

export const createTaskSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be at most 200 characters'),
  description: z.string().max(2000, 'Description must be at most 2000 characters').optional(),
  category: z.enum(['Learning', 'Setup', 'Meeting', 'Documentation', 'Development', 'Other']),
  status: z.enum(['NotStarted', 'InProgress', 'Completed', 'Blocked']).default('NotStarted'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  date: z.string().optional(),
  category: z.enum(['Learning', 'Setup', 'Meeting', 'Documentation', 'Development', 'Other']).optional(),
  status: z.enum(['NotStarted', 'InProgress', 'Completed', 'Blocked']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
