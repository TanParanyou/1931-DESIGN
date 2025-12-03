'use client';

import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Menu, Search, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { MenuOverlay } from './MenuOverlay';
import { useLanguage } from '@/lib/LanguageContext';

export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // const pathname = usePathname();
    // const isHome = pathname === '/';
    const { language, setLanguage } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleLanguage = () => {
        setLanguage(language === 'EN' ? 'TH' : 'EN');
    };

    return (
        <>
            <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <header
                className={cn(
                    'fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-out px-6 py-4',
                    isScrolled ? 'glass py-3' : 'bg-transparent py-6'
                )}
            >
                <div className="max-w-[1920px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 text-white"
                        >
                            <Menu size={24} strokeWidth={1.5} />
                        </button>
                        <Link href="/">
                            <Logo
                                className={isScrolled ? 'scale-90 transition-transform' : ''}
                                light={true}
                            />
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* <button className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 text-white">
                            <Search size={20} strokeWidth={1.5} />
                        </button> */}

                        <button
                            onClick={toggleLanguage}
                            className="text-xs font-medium tracking-[0.2em] hover:bg-white/10 px-3 py-1 rounded-full transition-all duration-300 text-white border border-white/20"
                        >
                            {language === 'EN' ? 'TH' : 'EN'}
                        </button>
                    </div>
                </div>
            </header>
        </>
    );
};
