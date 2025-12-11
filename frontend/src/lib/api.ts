import axios, { AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL_LOCAL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL + '/api',
    timeout: 10000, // 10 seconds
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Prevent redirect loop if the error is from the login endpoint itself
        if (originalRequest.url?.includes('/auth/login')) {
            return Promise.reject(error);
        }

        // If error is 401 and we haven't tried to refresh yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken =
                localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    // Call refresh token endpoint
                    // We use axios directly to avoid interceptor loop loop if this fails (though we check _retry)
                    // Or create a new instance. But here we can just use the base URL.
                    const response = await axios.post(`${API_URL}/api/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    if (response.data.success) {
                        const { token, refresh_token } = response.data.data;
                        const isLocal = !!localStorage.getItem('token'); // Determine which storage to use based on existing

                        // Update local storage
                        if (isLocal) {
                            localStorage.setItem('token', token);
                            localStorage.setItem('refresh_token', refresh_token);
                        } else {
                            sessionStorage.setItem('token', token);
                            sessionStorage.setItem('refresh_token', refresh_token);
                        }

                        // Update header for future requests
                        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                        // Update current request header
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;

                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    // Refresh failed, clear session and redirect
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user');
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('refresh_token');
                    sessionStorage.removeItem('user');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token available
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// Helper methods that unwrap the response.data automatically
// Use these if you want to skip the `response.data` step and get the server body directly.
export const apiHelpers = {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
        api.get<T>(url, config).then((res) => res.data),
    post: <T>(url: string, body: unknown, config?: AxiosRequestConfig) =>
        api.post<T>(url, body, config).then((res) => res.data),
    put: <T>(url: string, body: unknown, config?: AxiosRequestConfig) =>
        api.put<T>(url, body, config).then((res) => res.data),
    delete: <T>(url: string, config?: AxiosRequestConfig) =>
        api.delete<T>(url, config).then((res) => res.data),
};
