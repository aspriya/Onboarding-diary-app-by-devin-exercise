import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { tasksRouter } from './routes/tasks';
import { issuesRouter } from './routes/issues';
import { feedbackRouter } from './routes/feedback';
import { notesRouter } from './routes/notes';
import { dashboardRouter } from './routes/dashboard';
import { analyticsRouter } from './routes/analytics';
import { reportsRouter } from './routes/reports';
import { managerRouter } from './routes/manager';
import { searchRouter } from './routes/search';
import { checklistRouter } from './routes/checklist';
import { adminRouter } from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/notes', notesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/manager', managerRouter);
app.use('/api/search', searchRouter);
app.use('/api/checklists', checklistRouter);
app.use('/api/admin', adminRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
