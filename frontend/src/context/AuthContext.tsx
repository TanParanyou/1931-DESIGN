'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    active: boolean;
    phone?: string;
    address?: string;
    line_id?: string;
    info?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, refreshToken: string, user: User, remember?: boolean) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check localStorage first (persistent), then sessionStorage (session only)
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        const storedRefreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            if (storedRefreshToken) setRefreshToken(storedRefreshToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newRefreshToken: string, newUser: User, remember: boolean = true) => {
        setToken(newToken);
        setRefreshToken(newRefreshToken);
        setUser(newUser);

        if (remember) {
            localStorage.setItem('token', newToken);
            localStorage.setItem('refresh_token', newRefreshToken);
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            sessionStorage.setItem('token', newToken);
            sessionStorage.setItem('refresh_token', newRefreshToken);
            sessionStorage.setItem('user', JSON.stringify(newUser));
        }
        router.push('/admin');
    };

    const logout = () => {
        setToken(null);
        setRefreshToken(null);
        setUser(null);

        // Clear both storages to be safe
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refresh_token');
        sessionStorage.removeItem('user');

        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
