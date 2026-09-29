import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { otpService } from '../services/otp.service';
import { sendSuccess } from '../utils/apiResponse';

export class AuthController {
    public register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            const user = await authService.register(email, password);

            return sendSuccess(
                res,
                user,
                'User registered successfully. A 6-digit verification code has been sent to your email.',
                201
            );
        } catch (error) {
            next(error);
        }
    };

    public verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, code } = req.body;
            const result = await authService.verifyOTPAndLogin(email, code);

            return sendSuccess(
                res,
                result,
                'Email verified successfully.'
            );
        } catch (error) {
            next(error);
        }
    };

    public resendOTP = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;
            const result = await otpService.resendOTP(email);

            return sendSuccess(
                res,
                result,
                'A new verification code has been sent to your email.'
            );
        } catch (error) {
            next(error);
        }
    };

    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);

            return sendSuccess(res, result, 'Login successful');
        } catch (error) {
            next(error);
        }
    };

    public getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            return sendSuccess(res, { user: req.user }, 'Authenticated user profile retrieved');
        } catch (error) {
            next(error);
        }
    };
}

export const authController = new AuthController();
