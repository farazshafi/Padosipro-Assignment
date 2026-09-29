export const validateProfileInput = (body: any) => {
    const errors: string[] = [];
    const { name, mobile_number, address, business_name } = body || {};

    // Name validation
    if (!name || typeof name !== 'string' || !name.trim()) {
        errors.push('Full name is required');
    } else {
        const cleanName = name.trim();
        // Require at least 2 characters, valid name characters, and at least 2 letters
        const nameRegex = /^[a-zA-Z\s'.]{2,50}$/;
        const hasLetters = (cleanName.match(/[a-zA-Z]/g) || []).length >= 2;
        if (!nameRegex.test(cleanName) || !hasLetters) {
            errors.push('Full name must contain at least 2 letters and only valid characters (e.g. Rahul Sharma)');
        }
    }

    // Indian Mobile Number validation (+91 followed by 10 digits starting with 6-9)
    if (!mobile_number || typeof mobile_number !== 'string' || !mobile_number.trim()) {
        errors.push('Mobile number is required');
    } else {
        const indianMobileRegex = /^\+91[6-9]\d{9}$/;
        const cleanMobile = mobile_number.trim();
        if (!indianMobileRegex.test(cleanMobile)) {
            errors.push('Mobile number must be a valid Indian number (+91 followed by 10 digits)');
        }
    }

    // Address validation
    if (!address || typeof address !== 'string' || !address.trim()) {
        errors.push('Address is required');
    }

    // Business name is optional, but if provided, must be a string
    if (business_name !== undefined && business_name !== null && typeof business_name !== 'string') {
        errors.push('Business name must be a text value');
    }

    return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
    };
};
