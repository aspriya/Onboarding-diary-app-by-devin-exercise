import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { listNotes, getNote, createNote, updateNote, deleteNote } from '../controllers/notes';

const router = Router();

router.use(authenticate);

router.get('/', listNotes);
router.get('/:id', getNote);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export const notesRouter = router;
