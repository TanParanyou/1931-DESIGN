'use client';

import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '../context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
                <LanguageProvider>{children}</LanguageProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
