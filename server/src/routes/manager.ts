import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getRecruits, getRecruitDashboard } from '../controllers/manager';

const router = Router();

router.use(authenticate);
router.use(authorize('manager', 'admin'));

router.get('/recruits', getRecruits);
router.get('/recruits/:recruitId', getRecruitDashboard);

export const managerRouter = router;
