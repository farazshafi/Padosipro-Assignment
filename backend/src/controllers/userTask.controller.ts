import { Request, Response, NextFunction } from 'express';
import { userTaskService } from '../services/userTask.service';
import { sendSuccess } from '../utils/apiResponse';

export class UserTaskController {
    public getUserTasks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.userId;
            const tasks = await userTaskService.getUserSelectedTasks(userId);
            return sendSuccess(res, tasks, 'User selected tasks retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    public saveUserTasks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.userId;
            const { taskIds } = req.body;

            const tasks = await userTaskService.saveUserSelectedTasks(userId, taskIds);
            return sendSuccess(res, tasks, 'Selected tasks saved successfully');
        } catch (error) {
            next(error);
        }
    };
}

export const userTaskController = new UserTaskController();
