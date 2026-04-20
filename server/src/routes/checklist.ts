import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  assignChecklist,
  getMyChecklists,
  getMyChecklist,
  updateChecklistItem,
} from '../controllers/checklist';

export const checklistRouter = Router();

checklistRouter.use(authenticate);

// Template CRUD (admin only for create/update/delete)
checklistRouter.get('/templates', listTemplates);
checklistRouter.get('/templates/:id', getTemplate);
checklistRouter.post('/templates', authorize('admin'), createTemplate);
checklistRouter.put('/templates/:id', authorize('admin'), updateTemplate);
checklistRouter.delete('/templates/:id', authorize('admin'), deleteTemplate);

// Assignment (manager/admin)
checklistRouter.post('/assign', authorize('manager', 'admin'), assignChecklist);

// Recruit views
checklistRouter.get('/my', getMyChecklists);
checklistRouter.get('/my/:id', getMyChecklist);
checklistRouter.put('/my/:checklistId/items/:itemId', updateChecklistItem);
