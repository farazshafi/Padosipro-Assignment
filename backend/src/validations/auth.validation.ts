export const validateRegisterInput = (body: any) => {
    const errors: string[] = [];

    const { email, password, confirmPassword } = body || {};

    // Email validation
    if (!email || typeof email !== 'string' || !email.trim()) {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            errors.push('Please provide a valid email address');
        }
    }

    // Password validation
    if (!password || typeof password !== 'string') {
        errors.push('Password is required');
    } else {
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
            errors.push('Password must contain at least one letter and one number');
        }
    }

    // Confirm password validation
    if (!confirmPassword) {
        errors.push('Confirm password is required');
    } else if (password !== confirmPassword) {
        errors.push('Password and confirm password do not match');
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
    };
};
