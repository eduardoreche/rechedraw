export interface ApiError {
    message: string;
    status?: number;
}

const BASE_URL = '/api'; // Vite proxy will handle this

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        const error: ApiError = {
            message: data.error?.message || 'An error occurred',
            status: response.status,
        };
        throw error;
    }

    return data as T;
}

export const api = {
    get: <T>(endpoint: string) => fetcher<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body: any) =>
        fetcher<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: any) =>
        fetcher<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string) => fetcher<T>(endpoint, { method: 'DELETE' }),
};
