import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { exportTasksCsv, exportIssuesCsv, exportFullReport } from '../controllers/reports';

const router = Router();

router.use(authenticate);

router.get('/tasks/csv', exportTasksCsv);
router.get('/issues/csv', exportIssuesCsv);
router.get('/full', exportFullReport);

export const reportsRouter = router;
