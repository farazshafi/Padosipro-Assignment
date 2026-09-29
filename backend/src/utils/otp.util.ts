import crypto from 'crypto';

export const generateOTP = (): string => {
    // Generate random 6-digit number string [100000 - 999999]
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOTP = (otp: string): string => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

export const isOTPExpired = (expiresAt: Date | string): boolean => {
    const expiry = new Date(expiresAt).getTime();
    return Date.now() > expiry;
};

export const canResendOTP = (resendAvailableAt: Date | string): boolean => {
    const availableAt = new Date(resendAvailableAt).getTime();
    return Date.now() >= availableAt;
};

export const hasExceededAttempts = (attempts: number, maxAttempts = 5): boolean => {
    return attempts >= maxAttempts;
};
