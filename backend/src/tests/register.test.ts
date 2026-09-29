import bcrypt from 'bcrypt';
import { validateRegisterInput } from '../validations/auth.validation';

describe('User Registration Validation & Password Hashing Tests', () => {
    describe('validateRegisterInput', () => {
        it('should fail when email is invalid', () => {
            const result = validateRegisterInput({
                email: 'invalid-email',
                password: 'Password123',
                confirmPassword: 'Password123',
            });
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Please provide a valid email address');
        });

        it('should fail when password is less than 8 characters', () => {
            const result = validateRegisterInput({
                email: 'test@example.com',
                password: 'Pass1',
                confirmPassword: 'Pass1',
            });
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must be at least 8 characters long');
        });

        it('should fail when password lacks numbers', () => {
            const result = validateRegisterInput({
                email: 'test@example.com',
                password: 'PasswordOnly',
                confirmPassword: 'PasswordOnly',
            });
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one letter and one number');
        });

        it('should fail when password and confirmPassword do not match', () => {
            const result = validateRegisterInput({
                email: 'test@example.com',
                password: 'Password123',
                confirmPassword: 'DifferentPassword123',
            });
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password and confirm password do not match');
        });

        it('should pass for valid registration payload', () => {
            const result = validateRegisterInput({
                email: 'user@padosipro.com',
                password: 'SecurePassword123',
                confirmPassword: 'SecurePassword123',
            });
            expect(result.isValid).toBe(true);
            expect(result.errors).toBeUndefined();
        });
    });

    describe('Password Hashing Behavior', () => {
        it('should generate a valid bcrypt hash and verify correctly', async () => {
            const rawPassword = 'MySecretPassword123';
            const saltRounds = 10;
            const hash = await bcrypt.hash(rawPassword, saltRounds);

            // Verify plaintext password is not stored equal to raw string
            expect(hash).not.toBe(rawPassword);
            expect(hash).toMatch(/^\$2[ayb]\$.{56}$/);

            // Verify bcrypt compare succeeds for matching password
            const isMatch = await bcrypt.compare(rawPassword, hash);
            expect(isMatch).toBe(true);

            // Verify bcrypt compare fails for wrong password
            const isWrongMatch = await bcrypt.compare('WrongPassword123', hash);
            expect(isWrongMatch).toBe(false);
        });
    });
});
