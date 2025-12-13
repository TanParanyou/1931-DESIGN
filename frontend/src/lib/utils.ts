import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Extract error message from API errors (supports Axios errors and standard errors)
 */
export function getErrorMessage(error: unknown): string {
    // Check for Axios-like error with response.data.message
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError?.response?.data?.message) {
        return axiosError.response.data.message;
    }

    // Check for standard Error object
    if (error instanceof Error) {
        return error.message;
    }

    // Fallback for unknown error types
    return 'An unexpected error occurred';
}
