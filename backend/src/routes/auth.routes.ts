import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { validateRegisterInput } from '../validations/auth.validation';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

// Public Auth Endpoints
router.post(
    '/register',
    validateRequest({ body: validateRegisterInput }),
    authController.register
);

router.post(
    '/verify-otp',
    validateRequest({
        body: (body) => {
            const errors: string[] = [];
            if (!body.email) errors.push('Email is required');
            if (!body.code || typeof body.code !== 'string' || body.code.trim().length !== 6) {
                errors.push('6-digit OTP code is required');
            }
            return { isValid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
        },
    }),
    authController.verifyOTP
);

router.post(
    '/resend-otp',
    validateRequest({
        body: (body) => {
            const errors: string[] = [];
            if (!body.email) errors.push('Email is required');
            return { isValid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
        },
    }),
    authController.resendOTP
);

router.post(
    '/login',
    validateRequest({
        body: (body) => {
            const errors: string[] = [];
            if (!body.email) errors.push('Email is required');
            if (!body.password) errors.push('Password is required');
            return { isValid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
        },
    }),
    authController.login
);

// Protected Endpoint
router.get('/me', authenticateJwt, authController.getMe);

export default router;
