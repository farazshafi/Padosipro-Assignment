import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

// Protect task endpoints with JWT authentication
router.use(authenticateJwt);

router.get('/categories', taskController.getCategories);
router.get('/', taskController.getCatalogue);

export default router;
