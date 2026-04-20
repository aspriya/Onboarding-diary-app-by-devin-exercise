import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { listUsers, getUser, createUser, updateUser, deleteUser } from '../controllers/admin';

export const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(authorize('admin'));

adminRouter.get('/users', listUsers);
adminRouter.get('/users/:id', getUser);
adminRouter.post('/users', createUser);
adminRouter.put('/users/:id', updateUser);
adminRouter.delete('/users/:id', deleteUser);
