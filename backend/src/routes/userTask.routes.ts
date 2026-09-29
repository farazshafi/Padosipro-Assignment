import { Router } from 'express';
import { userTaskController } from '../controllers/userTask.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Protect endpoints with JWT authentication
router.use(authenticateJwt);

router.get('/', userTaskController.getUserTasks);
router.post(
    '/',
    validateRequest({
        body: (body) => {
            const errors: string[] = [];
            if (!body || !Array.isArray(body.taskIds)) {
                errors.push('taskIds array is required');
            }
            return { isValid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
        },
    }),
    userTaskController.saveUserTasks
);

export default router;
