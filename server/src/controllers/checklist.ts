import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { AppError, unauthorizedError, notFoundError } from '../utils/errors';
import { ZodError } from 'zod';
import {
  createTemplateSchema,
  updateTemplateSchema,
  assignChecklistSchema,
  updateChecklistItemSchema,
} from '../validators/checklist';

function formatZodError(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!details[path]) details[path] = [];
    details[path].push(issue.message);
  }
  return details;
}

// ---- Templates (admin only) ----

export async function listTemplates(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const templates = await prisma.checklistTemplate.findMany({
      where: { isActive: true },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: templates });
  } catch (err) {
    next(err);
  }
}

export async function getTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const template = await prisma.checklistTemplate.findFirst({
      where: { id, isActive: true },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!template) return next(notFoundError('Template not found'));
    res.json({ data: template });
  } catch (err) {
    next(err);
  }
}

export async function createTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const parsed = createTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', formatZodError(parsed.error)));
    }

    const template = await prisma.checklistTemplate.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        createdBy: req.user.userId,
        items: { create: parsed.data.items },
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });

    res.status(201).json({ data: template });
  } catch (err) {
    next(err);
  }
}

export async function updateTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const existing = await prisma.checklistTemplate.findFirst({ where: { id, isActive: true } });
    if (!existing) return next(notFoundError('Template not found'));

    const parsed = updateTemplateSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', formatZodError(parsed.error)));
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.name) updateData.name = parsed.data.name;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;

    if (parsed.data.items) {
      await prisma.checklistTemplateItem.deleteMany({ where: { templateId: id } });
      await prisma.checklistTemplateItem.createMany({
        data: parsed.data.items.map((item) => ({
          templateId: id,
          title: item.title,
          description: item.description,
          sortOrder: item.sortOrder,
        })),
      });
    }

    const template = await prisma.checklistTemplate.update({
      where: { id },
      data: updateData,
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });

    res.json({ data: template });
  } catch (err) {
    next(err);
  }
}

export async function deleteTemplate(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const existing = await prisma.checklistTemplate.findFirst({ where: { id, isActive: true } });
    if (!existing) return next(notFoundError('Template not found'));

    await prisma.checklistTemplate.update({ where: { id }, data: { isActive: false } });
    res.json({ message: 'Template deleted' });
  } catch (err) {
    next(err);
  }
}

// ---- Assignment (manager/admin) ----

export async function assignChecklist(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const parsed = assignChecklistSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', formatZodError(parsed.error)));
    }

    const template = await prisma.checklistTemplate.findFirst({
      where: { id: parsed.data.templateId, isActive: true },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!template) return next(notFoundError('Template not found'));

    const targetUser = await prisma.user.findFirst({
      where: { id: parsed.data.userId, isActive: true, role: 'recruit' },
    });
    if (!targetUser) return next(notFoundError('Recruit not found'));

    const assigned = await prisma.assignedChecklist.create({
      data: {
        userId: parsed.data.userId,
        templateId: template.id,
        name: template.name,
        description: template.description,
        items: {
          create: template.items.map((item) => ({
            title: item.title,
            description: item.description,
            sortOrder: item.sortOrder,
          })),
        },
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });

    res.status(201).json({ data: assigned });
  } catch (err) {
    next(err);
  }
}

// ---- Recruit checklist views ----

export async function getMyChecklists(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const checklists = await prisma.assignedChecklist.findMany({
      where: { userId: req.user.userId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: checklists });
  } catch (err) {
    next(err);
  }
}

export async function getMyChecklist(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const id = req.params.id as string;
    const checklist = await prisma.assignedChecklist.findFirst({
      where: { id, userId: req.user.userId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!checklist) return next(notFoundError('Checklist not found'));
    res.json({ data: checklist });
  } catch (err) {
    next(err);
  }
}

export async function updateChecklistItem(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return next(unauthorizedError());

    const checklistId = req.params.checklistId as string;
    const itemId = req.params.itemId as string;

    const checklist = await prisma.assignedChecklist.findFirst({
      where: { id: checklistId, userId: req.user.userId },
    });
    if (!checklist) return next(notFoundError('Checklist not found'));

    const item = await prisma.assignedChecklistItem.findFirst({
      where: { id: itemId, checklistId },
    });
    if (!item) return next(notFoundError('Checklist item not found'));

    const parsed = updateChecklistItemSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(400, 'VALIDATION_ERROR', 'Validation failed', formatZodError(parsed.error)));
    }

    const updatedItem = await prisma.assignedChecklistItem.update({
      where: { id: itemId },
      data: {
        isCompleted: parsed.data.isCompleted,
        completedAt: parsed.data.isCompleted ? new Date() : null,
        notes: parsed.data.notes,
      },
    });

    const allItems = await prisma.assignedChecklistItem.findMany({ where: { checklistId } });
    const allCompleted = allItems.every((i) => i.isCompleted);
    if (allCompleted) {
      await prisma.assignedChecklist.update({
        where: { id: checklistId },
        data: { completedAt: new Date() },
      });
    } else if (checklist.completedAt) {
      await prisma.assignedChecklist.update({
        where: { id: checklistId },
        data: { completedAt: null },
      });
    }

    res.json({ data: updatedItem });
  } catch (err) {
    next(err);
  }
}
