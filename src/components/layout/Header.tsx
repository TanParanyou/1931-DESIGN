"use client";

import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Menu, Search, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuOverlay } from './MenuOverlay';
import { useLanguage } from '@/lib/LanguageContext';
import { useTheme } from '@/lib/ThemeContext';

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === '/';
    const { language, setLanguage } = useLanguage();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Text color logic: Black if scrolled OR not on home page. White only if on home AND not scrolled.
    // In dark mode: Always white/light unless specific override needed.
    // Actually, let's keep the logic but adapt "text-black" to be "text-black dark:text-white"

    const isLightOnDark = !isScrolled && isHome;

    // Base text color
    const baseTextColor = isLightOnDark ? "text-white" : "text-black dark:text-white";

    // Logo color logic needs to be handled inside Logo component or passed as prop
    // For now, let's assume Logo handles its own color or we pass a prop.
    // The existing Logo component takes `light` prop.
    // light={true} -> White text. light={false} -> Black text.
    // In dark mode, we almost always want white text, EXCEPT maybe if we want a specific dark theme look.
    // But usually dark mode = white text on dark bg.
    // So light={true} should be passed if (isLightOnDark OR theme === 'dark')

    // Wait, Logo component implementation:
    // <span className={cn("font-bold tracking-tighter text-2xl", light ? "text-white" : "text-black")}>
    // We need to update Logo component to support dark mode class, OR pass correct prop.
    // Let's update Logo component first? No, let's pass correct prop here.
    // If theme is dark, we want white logo.

    const logoLight = isLightOnDark || theme === 'dark';

    const toggleLanguage = () => {
        setLanguage(language === 'EN' ? 'TH' : 'EN');
    };

    return (
        <>
            <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ease-in-out px-6 py-4",
                    isScrolled ? "bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm py-3 pointer-events-auto" : "bg-transparent pointer-events-none"
                )}
            >
                <div className="max-w-[1920px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className={cn("p-2 hover:opacity-70 transition-opacity pointer-events-auto", baseTextColor)}
                        >
                            <Menu size={28} strokeWidth={1.5} />
                        </button>
                        <Link href="/" className="pointer-events-auto">
                            <Logo className={isScrolled ? "scale-90 transition-transform" : ""} light={logoLight} />
                        </Link>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className={cn("p-2 hover:opacity-70 transition-opacity pointer-events-auto", baseTextColor)}>
                            <Search size={24} strokeWidth={1.5} />
                        </button>

                        <button
                            onClick={toggleTheme}
                            className={cn("p-2 hover:opacity-70 transition-opacity pointer-events-auto", baseTextColor)}
                        >
                            {theme === 'light' ? <Moon size={20} strokeWidth={1.5} /> : <Sun size={20} strokeWidth={1.5} />}
                        </button>

                        <button
                            onClick={toggleLanguage}
                            className={cn(
                                "text-sm font-medium tracking-widest hover:opacity-70 transition-opacity pointer-events-auto",
                                baseTextColor
                            )}
                        >
                            {language === 'EN' ? 'TH' : 'EN'}
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
};

