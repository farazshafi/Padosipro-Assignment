import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/appError';
import { sendError } from '../utils/apiResponse';
import { env } from '../config/env';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
): Response => {
    if (err instanceof AppError) {
        return sendError(res, err.message, err.statusCode, err.errors);
    }

    // Handle JSON parse syntax errors from body-parser
    if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
        return sendError(res, 'Malformed JSON payload', 400);
    }

    console.error('Unhandled Error:', err);

    const message = env.NODE_ENV === 'production'
        ? 'An unexpected server error occurred'
        : err.message || 'Internal Server Error';

    return sendError(res, message, 500);
};

export const notFoundHandler = (req: Request, res: Response): Response => {
    return sendError(res, `Route ${req.originalUrl} not found`, 404);
};
