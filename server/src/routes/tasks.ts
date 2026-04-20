import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/tasks';

const router = Router();

router.use(authenticate);

router.get('/', listTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export const tasksRouter = router;
