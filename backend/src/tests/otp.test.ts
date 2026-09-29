import { generateOTP, hashOTP, isOTPExpired, canResendOTP, hasExceededAttempts } from '../utils/otp.util';

describe('OTP Utility Unit Tests', () => {
    it('should generate a 6-digit numeric string', () => {
        const otp = generateOTP();
        expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate a valid SHA-256 hash', () => {
        const otp = '123456';
        const hash = hashOTP(otp);
        expect(hash).toHaveLength(64); // 64 hex characters for SHA-256
        expect(hash).not.toBe(otp);
    });

    it('should correctly detect expired OTPs', () => {
        const pastTime = new Date(Date.now() - 1000 * 60 * 11); // 11 mins ago
        const futureTime = new Date(Date.now() + 1000 * 60 * 10); // 10 mins in future

        expect(isOTPExpired(pastTime)).toBe(true);
        expect(isOTPExpired(futureTime)).toBe(false);
    });

    it('should enforce 30-second resend cooldown', () => {
        const activeCooldown = new Date(Date.now() + 20 * 1000); // 20s remaining
        const expiredCooldown = new Date(Date.now() - 5 * 1000); // Cooldown finished

        expect(canResendOTP(activeCooldown)).toBe(false);
        expect(canResendOTP(expiredCooldown)).toBe(true);
    });

    it('should enforce maximum 5 attempts', () => {
        expect(hasExceededAttempts(0, 5)).toBe(false);
        expect(hasExceededAttempts(4, 5)).toBe(false);
        expect(hasExceededAttempts(5, 5)).toBe(true);
        expect(hasExceededAttempts(6, 5)).toBe(true);
    });
});
