import { env } from '../../config/env';
import { authStorage } from '../storage/authStorage';
import { ApiResponse, ApiError, RequestOptions } from './types';

/**
 * Custom API client wrapping fetch with auto-token injection, timeout, and error handling.
 */
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = env.API_URL) {
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    }

    /**
     * Primary HTTP request method
     */
    async request<T = any>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<ApiResponse<T>> {
        const {
            body,
            params,
            requiresAuth = true,
            timeoutMs = env.API_TIMEOUT_MS,
            headers: customHeaders,
            ...restOptions
        } = options;

        // Construct full URL with query parameters
        let fullUrl = endpoint.startsWith('http')
            ? endpoint
            : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                fullUrl += `${fullUrl.includes('?') ? '&' : '?'}${queryString}`;
            }
        }

        // Prepare headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(customHeaders as Record<string, string>),
        };

        if (requiresAuth) {
            const token = await authStorage.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        // Setup abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const fetchOptions: RequestInit = {
                ...restOptions,
                headers,
                signal: controller.signal,
            };

            if (body) {
                fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
            }

            const response = await fetch(fullUrl, fetchOptions);
            clearTimeout(timeoutId);

            let responseData: any;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            if (!response.ok) {
                const errorMessage =
                    responseData?.message ||
                    responseData?.error ||
                    `HTTP Error ${response.status}: ${response.statusText}`;

                throw new ApiError(
                    errorMessage,
                    response.status,
                    responseData,
                    responseData?.errors
                );
            }

            // Standardize response payload
            if (typeof responseData === 'object' && responseData !== null && 'success' in responseData) {
                return responseData as ApiResponse<T>;
            }

            return {
                success: true,
                data: responseData as T,
            };
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new ApiError('Request timeout. Please check your internet connection.', 408);
            }

            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError(
                error.message || 'Network request failed. Please check server availability.',
                0
            );
        }
    }

    get<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'POST', body });
    }

    put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'PUT', body });
    }

    patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
    }

    delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
