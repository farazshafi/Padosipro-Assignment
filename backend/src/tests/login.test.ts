import jwt from 'jsonwebtoken';
import { authenticateJwt } from '../middleware/auth.middleware';
import { env } from '../config/env';

describe('Authentication & JWT Middleware Tests', () => {
    describe('JWT Verification', () => {
        it('should generate a valid JWT token and decode correct payload', () => {
            const payload = { userId: '12345-abcde', email: 'test@padosipro.com', isVerified: true };
            const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });

            const decoded = jwt.verify(token, env.JWT_SECRET) as any;
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.email).toBe(payload.email);
            expect(decoded.isVerified).toBe(true);
        });
    });

    describe('authenticateJwt Middleware', () => {
        let mockReq: any;
        let mockRes: any;
        let mockNext: any;

        beforeEach(() => {
            mockReq = { headers: {} };
            mockRes = {};
            mockNext = jest.fn();
        });

        it('should call next with UnauthorizedError when Authorization header is missing', () => {
            authenticateJwt(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(
                expect.objectContaining({ statusCode: 401, message: 'Authentication token missing or invalid' })
            );
        });

        it('should attach user payload to request when valid Bearer token is provided', () => {
            const payload = { userId: 'user-777', email: 'verified@padosipro.com', isVerified: true };
            const token = jwt.sign(payload, env.JWT_SECRET);
            mockReq.headers.authorization = `Bearer ${token}`;

            authenticateJwt(mockReq, mockRes, mockNext);

            expect(mockReq.user).toBeDefined();
            expect(mockReq.user.userId).toBe('user-777');
            expect(mockNext).toHaveBeenCalledWith(); // Called without errors
        });
    });
});
