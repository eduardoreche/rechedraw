// Standard API response types

export interface ApiSuccessResponse<T = any> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    error: {
        message: string;
        code?: string;
        details?: any;
    };
}

export interface ApiPaginatedResponse<T = any> {
    success: true;
    data: T[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Helper functions
export function successResponse<T>(data: T): ApiSuccessResponse<T> {
    return { success: true, data };
}

export function errorResponse(message: string, code?: string, details?: any): ApiErrorResponse {
    return {
        success: false,
        error: { message, code, details }
    };
}
