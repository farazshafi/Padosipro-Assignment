import { Router } from 'express';
import { profileController } from '../controllers/profile.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';
import { validateProfileInput } from '../validations/profile.validation';

const router = Router();

// Protect all profile endpoints with JWT middleware
router.use(authenticateJwt);

router.get('/', profileController.getProfile);
router.post('/', validateRequest({ body: validateProfileInput }), profileController.saveProfile);
router.put('/', validateRequest({ body: validateProfileInput }), profileController.saveProfile);

export default router;
