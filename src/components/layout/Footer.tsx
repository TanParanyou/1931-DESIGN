"use client";

import { Facebook, Instagram } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export const Footer = () => {
    const { t } = useLanguage();

    const linkIg = 'https://www.instagram.com/1931company?igsh=cjRoanFoNGJ1bnA3&utm_source=qr&ref=share';

    const linkFacebook = 'https://www.facebook.com/share/1BY4Sti3BB/?mibextid=wwXIfr&ref=share'

    return (
        <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md py-12 text-white">
            <div className="max-w-[1920px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6">
                <div className='flex flex-col gap-2'>
                    <div className="text-xs tracking-[0.2em] text-white/50 order-3 md:order-1">
                        © 2025 1931 CO., LTD. {t.footer.RIGHTS}
                    </div>
                    <div className="text-xs tracking-[0.2em] text-white/50 order-2 md:order-3 md:pr-20">
                        Power by <span className="text-green-300 font-medium">Nirvana</span>
                    </div>
                </div>


                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium tracking-[0.2em] order-1 md:order-2">
                    <Link href="/about" className="hover:text-green-300 transition-colors">{t.menu.ABOUT}</Link>
                    <Link href="/projects" className="hover:text-green-300 transition-colors">{t.menu.PROJECTS}</Link>
                    {/* <Link href="/news" className="hover:text-green-300 transition-colors">{t.menu.NEWS}</Link> */}
                    {/* <Link href="/careers" className="hover:text-green-300 transition-colors">{t.menu.CAREERS}</Link> */}
                    <Link href="/contact" className="hover:text-green-300 transition-colors">{t.menu.CONTACT}</Link>
                </div>

                <div className="flex gap-4 order-2 md:order-3 md:pr-20">
                    <Link href={linkFacebook} target="_blank" className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 text-white/80 hover:text-white">
                        <Facebook size={18} strokeWidth={1.5} />
                    </Link>
                    <Link href={linkIg} target="_blank" className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 text-white/80 hover:text-white">
                        <Instagram size={18} strokeWidth={1.5} />
                    </Link>
                </div>
            </div>
        </footer>
    );
};
