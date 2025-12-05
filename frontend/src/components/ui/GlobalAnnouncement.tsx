'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Info, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// You can move this to a separate config file later
export type AnnouncementType = 'maintenance' | 'condolence' | 'promotion' | 'info';

export interface Announcement {
    id: string;
    active: boolean;
    type: AnnouncementType;
    title?: string;
    message?: string;
    image?: string;
    link?: string;
    linkText?: string;
    dismissible: boolean;
    validUntil?: string; // ISO date string
}

// Mock configuration - In a real app, this could come from an API or CMS
const ACTIVE_ANNOUNCEMENT: Announcement | null = {
    // Example 1: Maintenance (Uncomment to test)
    // id: 'maint-001',
    // active: true,
    // type: 'maintenance',
    // title: 'System Maintenance',
    // message: 'Our website will be undergoing scheduled maintenance on Dec 10th from 2:00 AM to 6:00 AM. Some features may be unavailable.',
    // dismissible: true,

    // Example 2: Condolence (Uncomment to test)
    // id: 'condolence-001',
    // active: true,
    // type: 'condolence',
    // image: '/images/condolence-placeholder.jpg', // You'd need a real image
    // title: 'In Loving Memory',
    // message: 'We join the nation in mourning...',
    // dismissible: true,

    // Example 3: Promotion (Active Default for demo)
    id: 'promo-001',
    active: false, // Set to true to see it
    type: 'promotion',
    title: 'Year End Sale!',
    message: 'Get 20% off on all design consultations booked within this month. Don\'t miss out!',
    link: '/contact',
    linkText: 'Book Now',
    dismissible: true,
};

export default function GlobalAnnouncement() {
    const [isVisible, setIsVisible] = useState(true);
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);

    useEffect(() => {
        // Simulating fetching config
        const data = ACTIVE_ANNOUNCEMENT;

        if (data && data.active) {
            // Check if expired
            if (data.validUntil && new Date(data.validUntil) < new Date()) {
                return;
            }

            // Check if dismissed (if dismissible)
            if (data.dismissible) {
                const dismissedId = sessionStorage.getItem('announcement-dismissed');
                if (dismissedId === data.id) {
                    return;
                }
            }

            setAnnouncement(data);
            // Slight delay for entrance
            setTimeout(() => setIsVisible(true), 500);
        }
    }, []);

    const handleClose = () => {
        if (!announcement?.dismissible) return;

        setIsVisible(false);
        if (announcement) {
            sessionStorage.setItem('announcement-dismissed', announcement.id);
        }
    };

    if (!announcement) return null;

    // Theme configuration based on type
    const getTheme = () => {
        switch (announcement.type) {
            case 'maintenance':
                return {
                    bg: 'bg-zinc-900',
                    border: 'border-yellow-500/20',
                    icon: <AlertTriangle className="text-yellow-500 mb-4" size={48} />,
                    titleColor: 'text-yellow-500',
                    btnBg: 'bg-yellow-500 text-black hover:bg-yellow-400',
                };
            case 'condolence':
                return {
                    bg: 'bg-black',
                    border: 'border-white/10 grayscale',
                    icon: <Heart className="text-white/50 mb-4" size={48} />,
                    titleColor: 'text-white',
                    btnBg: 'bg-white text-black hover:bg-gray-200',
                    isGrayscale: true,
                };
            case 'promotion':
                return {
                    bg: 'bg-zinc-900',
                    border: 'border-green-500/30',
                    icon: null, // Maybe use image instead
                    titleColor: 'text-green-300',
                    btnBg: 'bg-green-500 text-black hover:bg-green-400',
                };
            default:
                return {
                    bg: 'bg-zinc-900',
                    border: 'border-white/10',
                    icon: <Info className="text-blue-500 mb-4" size={48} />,
                    titleColor: 'text-blue-500',
                    btnBg: 'bg-blue-500 text-white hover:bg-blue-600',
                };
        }
    };

    const theme = getTheme();

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className={`absolute inset-0 bg-black/80 backdrop-blur-sm ${!announcement.dismissible ? 'cursor-default' : 'cursor-pointer'}`}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', duration: 0.6 }}
                        className={`relative w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl ${theme.bg} ${theme.border}`}
                    >
                        {/* Optional Image for Promotion/Condolence */}
                        {announcement.image && (
                            <div className={`relative aspect-video w-full ${theme.isGrayscale ? 'grayscale' : ''}`}>
                                <Image
                                    src={announcement.image}
                                    alt={announcement.title || 'Announcement'}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div className="p-8 text-center relative z-10">
                            {!announcement.image && theme.icon}

                            {announcement.title && (
                                <h2 className={`text-2xl font-light tracking-wide mb-4 ${theme.titleColor}`}>
                                    {announcement.title}
                                </h2>
                            )}

                            {announcement.message && (
                                <p className="text-white/70 leading-relaxed mb-8 font-light">
                                    {announcement.message}
                                </p>
                            )}

                            <div className="flex justify-center gap-4">
                                {announcement.dismissible && (
                                    <button
                                        onClick={handleClose}
                                        className="px-6 py-2 rounded-full border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all text-sm tracking-widest"
                                    >
                                        CLOSE
                                    </button>
                                )}

                                {announcement.link && (
                                    <Link
                                        href={announcement.link}
                                        onClick={handleClose}
                                        className={`px-8 py-2 rounded-full text-sm font-bold tracking-widest transition-all shadow-lg ${theme.btnBg} ring-offset-2 ring-offset-black focus:ring-2`}
                                    >
                                        {announcement.linkText || 'LEARN MORE'}
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Top Right Close Button */}
                        {announcement.dismissible && (
                            <button
                                onClick={handleClose}
                                className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors z-20 bg-black/50 rounded-full p-1"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
