import { validateProfileInput } from '../validations/profile.validation';

describe('Profile Validation Unit Tests', () => {
    it('should fail when full name is missing', () => {
        const res = validateProfileInput({
            name: '',
            mobile_number: '+919876543210',
            address: '123 MG Road, Bengaluru',
        });
        expect(res.isValid).toBe(false);
        expect(res.errors).toContain('Full name is required');
    });

    it('should fail when mobile number is not in Indian +91 format', () => {
        const res = validateProfileInput({
            name: 'John Doe',
            mobile_number: '9876543210', // Missing +91
            address: '123 MG Road, Bengaluru',
        });
        expect(res.isValid).toBe(false);
        expect(res.errors).toContain('Mobile number must be a valid Indian number (+91 followed by 10 digits)');
    });

    it('should fail when mobile number starts with an invalid digit', () => {
        const res = validateProfileInput({
            name: 'John Doe',
            mobile_number: '+911876543210', // Starts with 1 instead of 6-9
            address: '123 MG Road, Bengaluru',
        });
        expect(res.isValid).toBe(false);
        expect(res.errors).toContain('Mobile number must be a valid Indian number (+91 followed by 10 digits)');
    });

    it('should pass for valid profile payload without business name', () => {
        const res = validateProfileInput({
            name: 'Rahul Sharma',
            mobile_number: '+919876543210',
            address: '45 Koramangala 4th Block, Bengaluru',
        });
        expect(res.isValid).toBe(true);
        expect(res.errors).toBeUndefined();
    });

    it('should pass for valid profile payload with optional business name', () => {
        const res = validateProfileInput({
            name: 'Rahul Sharma',
            mobile_number: '+919876543210',
            address: '45 Koramangala 4th Block, Bengaluru',
            business_name: 'Sharma Tech Services',
        });
        expect(res.isValid).toBe(true);
        expect(res.errors).toBeUndefined();
    });
});
