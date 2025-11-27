"use client";
import React from 'react';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md py-12 text-white">
            <div className="max-w-[1920px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6">
                <div className="text-xs tracking-[0.2em] text-white/50 order-3 md:order-1">
                    © 2025 1938 CO., LTD. {t.footer.RIGHTS}
                </div>

                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium tracking-[0.2em] order-1 md:order-2">
                    <Link href="/about" className="hover:text-purple-300 transition-colors">{t.menu.ABOUT}</Link>
                    <Link href="/projects" className="hover:text-purple-300 transition-colors">{t.menu.PROJECTS}</Link>
                    <Link href="/news" className="hover:text-purple-300 transition-colors">{t.menu.NEWS}</Link>
                    <Link href="/careers" className="hover:text-purple-300 transition-colors">{t.menu.CAREERS}</Link>
                    <Link href="/contact" className="hover:text-purple-300 transition-colors">{t.menu.CONTACT}</Link>
                </div>

                <div className="flex gap-4 order-2 md:order-3">
                    <Link href="#" className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 text-white/80 hover:text-white">
                        <Facebook size={18} strokeWidth={1.5} />
                    </Link>
                    <Link href="#" className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 text-white/80 hover:text-white">
                        <Instagram size={18} strokeWidth={1.5} />
                    </Link>
                    <Link href="#" className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 text-white/80 hover:text-white">
                        <Linkedin size={18} strokeWidth={1.5} />
                    </Link>
                </div>
            </div>
        </footer>
    );
};
