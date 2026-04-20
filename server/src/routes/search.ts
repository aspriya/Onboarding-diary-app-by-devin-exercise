import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { globalSearch } from '../controllers/search';

export const searchRouter = Router();

searchRouter.use(authenticate);

searchRouter.get('/', globalSearch);
