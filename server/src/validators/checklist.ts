import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  items: z.array(z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(500).optional(),
    sortOrder: z.number().int().min(0),
  })).min(1, 'At least one checklist item is required'),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  items: z.array(z.object({
    id: z.string().uuid().optional(),
    title: z.string().min(1).max(200),
    description: z.string().max(500).optional(),
    sortOrder: z.number().int().min(0),
  })).min(1).optional(),
});

export const assignChecklistSchema = z.object({
  templateId: z.string().uuid(),
  userId: z.string().uuid(),
});

export const updateChecklistItemSchema = z.object({
  isCompleted: z.boolean(),
  notes: z.string().max(500).optional(),
});
