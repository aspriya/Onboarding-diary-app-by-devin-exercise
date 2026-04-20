import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTaskStatusBreakdown,
  getTaskCategoryBreakdown,
  getIssueSeverityBreakdown,
  getFeedbackTypeBreakdown,
  getWeeklyProgress,
} from '../controllers/analytics';

const router = Router();

router.use(authenticate);

router.get('/task-status', getTaskStatusBreakdown);
router.get('/task-category', getTaskCategoryBreakdown);
router.get('/issue-severity', getIssueSeverityBreakdown);
router.get('/feedback-type', getFeedbackTypeBreakdown);
router.get('/weekly-progress', getWeeklyProgress);

export const analyticsRouter = router;
