import { Response } from 'express';

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: any;
}

export const sendSuccess = <T>(
    res: Response,
    data: T,
    message?: string,
    statusCode = 200
): Response => {
    const responseBody: ApiResponse<T> = {
        success: true,
        ...(message && { message }),
        data,
    };
    return res.status(statusCode).json(responseBody);
};

export const sendError = (
    res: Response,
    message: string,
    statusCode = 500,
    errors?: any
): Response => {
    const responseBody: ApiResponse = {
        success: false,
        message,
        ...(errors && { errors }),
    };
    return res.status(statusCode).json(responseBody);
};
