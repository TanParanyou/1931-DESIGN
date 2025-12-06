/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/constants';
import { ApiResponse } from '@/types';

// api
const prefix = '/api';

// Create Axios instance
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL + prefix,
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        // Unwrap the response data
        const apiResponse: ApiResponse<any> = response.data;

        // If the API returns a success flag as false, treat it as an error
        if (apiResponse.success === false) {
            const errorMessage = apiResponse.error?.message || 'API Error';
            return Promise.reject(new Error(errorMessage));
        }

        // Return the FULL response object so pagination can be accessed
        // We cast to any to bypass Axios declaration mismatch, as we are changing the return shape
        return apiResponse as any;
    },
    (error: AxiosError) => {
        // Handle HTTP errors
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const data = error.response.data as ApiResponse<any>;
            // Extract error message from new structure or fallback
            const message = data.error?.message || error.message || 'An error occurred';

            // You can handle specific status codes here
            if (error.response.status === 401) {
                // Handle unauthorized (e.g., redirect to login)
                console.warn('Unauthorized access');
                // window.location.href = '/login';
            }

            return Promise.reject(new Error(message));
        } else if (error.request) {
            // The request was made but no response was received
            return Promise.reject(new Error('No response from server'));
        } else {
            // Something happened in setting up the request that triggered an Error
            return Promise.reject(new Error(error.message));
        }
    }
);

// Generic API methods
export const api = {
    get: <T>(url: string, config?: AxiosRequestConfig) => axiosInstance.get<any, T>(url, config),
    post: <T>(url: string, body: any, config?: AxiosRequestConfig) =>
        axiosInstance.post<any, T>(url, body, config),
    put: <T>(url: string, body: any, config?: AxiosRequestConfig) =>
        axiosInstance.put<any, T>(url, body, config),
    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        axiosInstance.delete<any, T>(url, config),
};
