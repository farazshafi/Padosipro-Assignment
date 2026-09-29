export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Array<{ field?: string; message: string }>;
}

export class ApiError extends Error {
    status: number;
    data?: any;
    errors?: Array<{ field?: string; message: string }>;

    constructor(
        message: string,
        status: number,
        data?: any,
        errors?: Array<{ field?: string; message: string }>
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
        this.errors = errors;
    }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: any;
    params?: Record<string, string | number | boolean | undefined>;
    requiresAuth?: boolean;
    timeoutMs?: number;
}
