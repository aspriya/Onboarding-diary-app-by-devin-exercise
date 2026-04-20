import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getDashboardSummary, getRecentActivity } from '../controllers/dashboard';

const router = Router();

router.use(authenticate);

router.get('/summary', getDashboardSummary);
router.get('/activity', getRecentActivity);

export const dashboardRouter = router;
