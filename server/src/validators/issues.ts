import { z } from 'zod';

export const createIssueSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be at most 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be at most 2000 characters'),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
  status: z.enum(['Open', 'InProgress', 'Resolved', 'Closed']).default('Open'),
  resolutionNotes: z.string().max(2000, 'Resolution notes must be at most 2000 characters').optional(),
}).refine(
  (data) => {
    if ((data.status === 'Resolved' || data.status === 'Closed') && !data.resolutionNotes) {
      return false;
    }
    return true;
  },
  { message: 'Resolution notes are required when status is Resolved or Closed', path: ['resolutionNotes'] }
);

export const updateIssueSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  status: z.enum(['Open', 'InProgress', 'Resolved', 'Closed']).optional(),
  resolutionNotes: z.string().max(2000).optional(),
});

export const issueQuerySchema = z.object({
  status: z.enum(['Open', 'InProgress', 'Resolved', 'Closed']).optional(),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
export type IssueQueryInput = z.infer<typeof issueQuerySchema>;
