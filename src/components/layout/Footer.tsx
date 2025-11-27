"use client";
import React from 'react';
import { Facebook, Instagram, Linkedin } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="bg-white dark:bg-black text-black dark:text-white py-12 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-[1920px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6">
                <div className="text-sm tracking-widest text-gray-500 dark:text-gray-400 order-3 md:order-1">
                    © 2025 1938 CO., LTD. {t.footer.RIGHTS}
                </div>

                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium tracking-widest order-1 md:order-2">
                    <Link href="/about" className="hover:text-gray-500 dark:hover:text-gray-300 transition-colors">{t.menu.ABOUT}</Link>
                    <Link href="/projects" className="hover:text-gray-500 dark:hover:text-gray-300 transition-colors">{t.menu.PROJECTS}</Link>
                    <Link href="/news" className="hover:text-gray-500 dark:hover:text-gray-300 transition-colors">{t.menu.NEWS}</Link>
                    <Link href="/careers" className="hover:text-gray-500 dark:hover:text-gray-300 transition-colors">{t.menu.CAREERS}</Link>
                    <Link href="/contact" className="hover:text-gray-500 dark:hover:text-gray-300 transition-colors">{t.menu.CONTACT}</Link>
                </div>

                <div className="flex gap-4 order-2 md:order-3">
                    <Link href="#" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <Facebook size={20} strokeWidth={1.5} />
                    </Link>
                    <Link href="#" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <Instagram size={20} strokeWidth={1.5} />
                    </Link>
                    <Link href="#" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <Linkedin size={20} strokeWidth={1.5} />
                    </Link>
                </div>
            </div>
        </footer>
    );
};
