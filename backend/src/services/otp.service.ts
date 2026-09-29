import { query } from '../db';
import { generateOTP, hashOTP, isOTPExpired, canResendOTP, hasExceededAttempts } from '../utils/otp.util';
import { mailerService } from './mailer.service';
import { BadRequestError, NotFoundError } from '../errors/appError';
import { env } from '../config/env';

export class OTPService {
    /**
     * Generates, hashes, stores, and emails a new OTP for a user
     */
    public async createAndSendOTP(userId: string, email: string): Promise<{ resendAvailableAt: Date }> {
        const rawOTP = generateOTP();
        const otpHash = hashOTP(rawOTP);

        const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);
        const resendAvailableAt = new Date(Date.now() + env.OTP_RESEND_COOLDOWN_SECONDS * 1000);

        // Delete any existing OTPs for this user before inserting a new one
        await query('DELETE FROM email_otps WHERE user_id = $1', [userId]);

        const insertQuery = `
      INSERT INTO email_otps (user_id, otp_hash, attempts, expires_at, resend_available_at)
      VALUES ($1, $2, 0, $3, $4)
      RETURNING resend_available_at
    `;
        await query(insertQuery, [userId, otpHash, expiresAt, resendAvailableAt]);

        // Send email asynchronously via Mailpit
        await mailerService.sendOTPEmail(email, rawOTP);

        return { resendAvailableAt };
    }

    /**
     * Verifies an OTP code for an unverified user
     */
    public async verifyOTP(email: string, code: string): Promise<boolean> {
        const normalizedEmail = email.trim().toLowerCase();

        // 1. Fetch user by email
        const userRes = await query('SELECT id, is_verified FROM users WHERE email = $1', [normalizedEmail]);
        if (userRes.rows.length === 0) {
            throw new NotFoundError('User not found');
        }

        const user = userRes.rows[0];
        if (user.is_verified) {
            throw new BadRequestError('Email is already verified. Please log in.');
        }

        // 2. Fetch OTP record with SQL expiration check
        const otpRes = await query(
            'SELECT *, (expires_at < CURRENT_TIMESTAMP) AS is_expired FROM email_otps WHERE user_id = $1',
            [user.id]
        );
        if (otpRes.rows.length === 0) {
            throw new BadRequestError('No active OTP found. Please request a new code.');
        }

        const otpRecord = otpRes.rows[0];

        // 3. Check attempt count (max 5)
        if (hasExceededAttempts(otpRecord.attempts, env.OTP_MAX_ATTEMPTS)) {
            await query('DELETE FROM email_otps WHERE id = $1', [otpRecord.id]);
            throw new BadRequestError('Maximum verification attempts exceeded. Please request a new OTP.');
        }

        // 4. Check expiration (both SQL DB timestamp and JS Date check)
        if (otpRecord.is_expired || isOTPExpired(otpRecord.expires_at)) {
            await query('DELETE FROM email_otps WHERE id = $1', [otpRecord.id]);
            throw new BadRequestError('OTP code has expired. Please request a new one.');
        }

        // 5. Compare hash
        const inputHash = hashOTP(code.trim());
        if (inputHash !== otpRecord.otp_hash) {
            // Increment attempt counter
            const newAttempts = otpRecord.attempts + 1;
            await query('UPDATE email_otps SET attempts = $1 WHERE id = $2', [newAttempts, otpRecord.id]);

            const remainingAttempts = env.OTP_MAX_ATTEMPTS - newAttempts;
            if (remainingAttempts <= 0) {
                await query('DELETE FROM email_otps WHERE id = $1', [otpRecord.id]);
                throw new BadRequestError('Invalid OTP code. Maximum verification attempts exceeded.');
            }
            throw new BadRequestError(`Invalid OTP code. ${remainingAttempts} attempts remaining.`);
        }

        // 6. Verification successful: mark user verified and delete single-use OTP
        await query('UPDATE users SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
        await query('DELETE FROM email_otps WHERE id = $1', [otpRecord.id]);

        return true;
    }

    /**
     * Resends a fresh OTP enforcing 30-second cooldown
     */
    public async resendOTP(email: string): Promise<{ resendAvailableAt: Date }> {
        const normalizedEmail = email.trim().toLowerCase();

        const userRes = await query('SELECT id, is_verified FROM users WHERE email = $1', [normalizedEmail]);
        if (userRes.rows.length === 0) {
            throw new NotFoundError('User not found');
        }

        const user = userRes.rows[0];
        if (user.is_verified) {
            throw new BadRequestError('Email is already verified. Please log in.');
        }

        // Check resend cooldown
        const otpRes = await query('SELECT resend_available_at FROM email_otps WHERE user_id = $1', [user.id]);
        if (otpRes.rows.length > 0) {
            const resendAvailableAt = otpRes.rows[0].resend_available_at;
            if (!canResendOTP(resendAvailableAt)) {
                const secondsRemaining = Math.ceil((new Date(resendAvailableAt).getTime() - Date.now()) / 1000);
                throw new BadRequestError(`Please wait ${secondsRemaining} seconds before requesting a new OTP.`);
            }
        }

        return this.createAndSendOTP(user.id, normalizedEmail);
    }
}

export const otpService = new OTPService();
