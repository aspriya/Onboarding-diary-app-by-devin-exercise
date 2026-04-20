import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listFeedback, getFeedback, createFeedback, updateFeedback, deleteFeedback } from '../controllers/feedback';

const router = Router();

router.use(authenticate);

router.get('/', listFeedback);
router.get('/:id', getFeedback);
router.post('/', createFeedback);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);

export const feedbackRouter = router;
