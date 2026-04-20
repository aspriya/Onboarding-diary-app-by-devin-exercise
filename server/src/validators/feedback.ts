import { z } from 'zod';

export const createFeedbackSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject must be at most 200 characters'),
  type: z.enum(['Positive', 'Suggestion', 'Concern']),
  details: z.string().min(10, 'Details must be at least 10 characters').max(5000, 'Details must be at most 5000 characters'),
});

export const updateFeedbackSchema = createFeedbackSchema.partial();

export const feedbackQuerySchema = z.object({
  type: z.enum(['Positive', 'Suggestion', 'Concern']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;
export type FeedbackQueryInput = z.infer<typeof feedbackQuerySchema>;
