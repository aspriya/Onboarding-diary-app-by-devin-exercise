import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listIssues, getIssue, createIssue, updateIssue, deleteIssue } from '../controllers/issues';

const router = Router();

router.use(authenticate);

router.get('/', listIssues);
router.get('/:id', getIssue);
router.post('/', createIssue);
router.put('/:id', updateIssue);
router.delete('/:id', deleteIssue);

export const issuesRouter = router;
