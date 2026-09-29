import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { sendSuccess } from '../utils/apiResponse';

export class TaskController {
    public getCatalogue = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const category = req.query.category as string | undefined;
            const q = req.query.q as string | undefined;

            const catalogue = await taskService.getCatalogue(category, q);
            return sendSuccess(res, catalogue, 'Task catalogue retrieved successfully');
        } catch (error) {
            next(error);
        }
    };

    public getCategories = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const categories = await taskService.getCategories();
            return sendSuccess(res, categories, 'Task categories retrieved successfully');
        } catch (error) {
            next(error);
        }
    };
}

export const taskController = new TaskController();
