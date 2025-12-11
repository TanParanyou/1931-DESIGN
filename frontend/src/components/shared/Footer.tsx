'use client';

import { Facebook, Instagram, Github, Twitter, Mail } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { siteConfig } from '@/config/site.config';
import { settingService } from '@/services/setting.service';
import { useEffect, useState } from 'react';

// Icon mapper removed (unused)

export const Footer = () => {
    const { t } = useLanguage();
    const [settings, setSettings] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await settingService.getPublicSettings();
            if (data && Object.keys(data).length > 0) {
                setSettings(data);
            }
        };
        fetchSettings();
    }, []);

    // Helper to get value with fallback
    const getVal = (key: string, fallback: string) => settings[key] || fallback;

    // Social Links
    const socialLinks = [
        { key: 'social_facebook', icon: Facebook, fallback: siteConfig.social.facebook },
        { key: 'social_instagram', icon: Instagram, fallback: siteConfig.social.instagram },
        { key: 'social_twitter', icon: Twitter, fallback: siteConfig.social.twitter },
        { key: 'social_github', icon: Github, fallback: siteConfig.social.github },
    ].filter((item) => getVal(item.key, item.fallback || ''));

    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-md py-12 text-white">
            <div className="max-w-[1920px] mx-auto px-6 flex flex-col-reverse md:flex-row justify-between items-center gap-8 md:gap-6">
                <div className="flex flex-col gap-2">
                    <div className="text-xs tracking-[0.2em] text-white/50 order-3 md:order-1">
                        © {currentYear}{' '}
                        {getVal(
                            'business_legal_name',
                            siteConfig.business?.legalName || '1931 CO., LTD.'
                        )}{' '}
                        {t.footer.RIGHTS}
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium tracking-[0.2em] order-1 md:order-2">
                    <Link href="/about" className="hover:text-green-300 transition-colors">
                        {t.menu.ABOUT}
                    </Link>
                    <Link href="/projects" className="hover:text-green-300 transition-colors">
                        {t.menu.PROJECTS}
                    </Link>
                    <Link href="/contact" className="hover:text-green-300 transition-colors">
                        {t.menu.CONTACT}
                    </Link>
                </div>

                <div className="flex gap-4 order-2 md:order-3 md:pr-20">
                    {socialLinks.map(({ key, icon: Icon, fallback }) => {
                        const href = getVal(key, fallback || '');
                        if (!href) return null;
                        return (
                            <Link
                                key={key}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 text-white/80 hover:text-white"
                            >
                                <Icon size={18} strokeWidth={1.5} />
                            </Link>
                        );
                    })}
                </div>
            </div>
        </footer>
    );
};
