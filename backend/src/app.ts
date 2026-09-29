import express, { Application } from 'express';
import cors from 'cors';
import healthRouter from './routes/health.routes';
import authRouter from './routes/auth.routes';
import profileRouter from './routes/profile.routes';
import taskRouter from './routes/task.routes';
import userTaskRouter from './routes/userTask.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/user-tasks', userTaskRouter);
app.use('/api', healthRouter);
app.use('/', healthRouter); // Root health fallback

// 404 & Global Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
