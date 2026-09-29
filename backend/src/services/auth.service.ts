import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { ConflictError, UnauthorizedError, ForbiddenError, BadRequestError } from '../errors/appError';
import { otpService } from './otp.service';
import { env } from '../config/env';

export interface UserResponse {
    id: string;
    email: string;
    is_verified: boolean;
    created_at: string;
}

export interface LoginResponse {
    token: string;
    user: UserResponse;
}

export class AuthService {
    /**
     * Registers a new user, hashes password, and triggers OTP creation
     */
    public async register(email: string, password: string): Promise<UserResponse> {
        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const existingUserQuery = 'SELECT id FROM users WHERE email = $1';
        const existingUserRes = await query(existingUserQuery, [normalizedEmail]);

        if (existingUserRes.rows.length > 0) {
            throw new ConflictError('User with this email already exists');
        }

        // Hash password with bcrypt
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert user into database
        const insertQuery = `
      INSERT INTO users (email, password_hash, is_verified)
      VALUES ($1, $2, $3)
      RETURNING id, email, is_verified, created_at
    `;
        const insertRes = await query(insertQuery, [normalizedEmail, passwordHash, false]);
        const newUser = insertRes.rows[0];

        // Trigger OTP sending
        await otpService.createAndSendOTP(newUser.id, newUser.email);

        return {
            id: newUser.id,
            email: newUser.email,
            is_verified: newUser.is_verified,
            created_at: newUser.created_at,
        };
    }

    /**
     * Verifies OTP code and returns direct login token and user object
     */
    public async verifyOTPAndLogin(email: string, code: string): Promise<LoginResponse> {
        const normalizedEmail = email.trim().toLowerCase();
        await otpService.verifyOTP(normalizedEmail, code);

        const userRes = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        const user = userRes.rows[0];

        const token = jwt.sign(
            { userId: user.id, email: user.email, isVerified: user.is_verified },
            env.JWT_SECRET as string,
            { expiresIn: env.JWT_EXPIRES_IN as any }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                is_verified: user.is_verified,
                created_at: user.created_at,
            },
        };
    }

    /**
     * Logs in a verified user and returns a signed JWT token
     */
    public async login(email: string, password: string): Promise<LoginResponse> {
        const normalizedEmail = email.trim().toLowerCase();

        // 1. Fetch user by email
        const userRes = await query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        if (userRes.rows.length === 0) {
            throw new UnauthorizedError('Invalid email or password');
        }

        const user = userRes.rows[0];

        // 2. Validate password hash
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // 3. Enforce email verification (Only verified users can log in)
        if (!user.is_verified) {
            throw new ForbiddenError('Account is not verified. Please verify your email code before logging in.');
        }

        // 4. Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, isVerified: user.is_verified },
            env.JWT_SECRET as string,
            { expiresIn: env.JWT_EXPIRES_IN as any }
        );

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                is_verified: user.is_verified,
                created_at: user.created_at,
            },
        };
    }
}

export const authService = new AuthService();
