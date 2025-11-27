"use client";

import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// import { cn } from '@/lib/utils';

import { useLanguage } from '@/lib/LanguageContext';

interface MenuOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export const MenuOverlay: React.FC<MenuOverlayProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();

    const menuItems = [
        { label: t.menu.HOME, href: '/' },
        { label: t.menu.PROJECTS, href: '/projects' },
        { label: t.menu.ABOUT, href: '/about' },
        { label: t.menu.NEWS, href: '/news' },
        { label: t.menu.CAREERS, href: '/careers' },
        { label: t.menu.CONTACT, href: '/contact' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                    exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[150] bg-black/60 flex flex-col"
                >
                    {/* Close Button */}
                    <div className="flex justify-end p-6">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-all duration-300 text-white"
                        >
                            <X size={32} strokeWidth={1.5} />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 flex flex-col justify-center items-center gap-8">
                        {menuItems.map((item, index) => (
                            <motion.div
                                key={item.href} // Use href as key since label changes
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 40, opacity: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                            >
                                <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className="text-4xl md:text-6xl font-light tracking-widest text-white hover:text-purple-300 transition-colors relative group"
                                >
                                    {item.label}
                                    <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-purple-400 transition-all duration-300 group-hover:w-full" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer Info in Menu */}
                    <div className="p-12 text-center text-white/40 text-sm tracking-[0.3em]">
                        1938 CO., LTD.
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
