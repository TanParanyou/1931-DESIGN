'use client';

import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
    );
}
