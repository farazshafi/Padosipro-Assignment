import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../errors/appError';

export type ValidationSchema = {
    body?: (data: any) => { isValid: boolean; errors?: string[] };
    query?: (data: any) => { isValid: boolean; errors?: string[] };
    params?: (data: any) => { isValid: boolean; errors?: string[] };
};

export const validateRequest = (schema: ValidationSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const errorDetails: Record<string, string[]> = {};

        if (schema.body) {
            const result = schema.body(req.body);
            if (!result.isValid && result.errors) {
                errorDetails.body = result.errors;
            }
        }

        if (schema.query) {
            const result = schema.query(req.query);
            if (!result.isValid && result.errors) {
                errorDetails.query = result.errors;
            }
        }

        if (schema.params) {
            const result = schema.params(req.params);
            if (!result.isValid && result.errors) {
                errorDetails.params = result.errors;
            }
        }

        if (Object.keys(errorDetails).length > 0) {
            return next(new ValidationError('Invalid request parameters', errorDetails));
        }

        next();
    };
};
