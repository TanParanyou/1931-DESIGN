'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { News } from '@/types';
import Link from 'next/link';
import { useEffect } from 'react';

interface NewsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    item: News | null;
}

export default function NewsDialog({ isOpen, onClose, item }: NewsDialogProps) {
    // Lock body scroll when dialog is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Wait for close animation to finish before removing style? 
            // Actually framer motion handles exit animation, but body scroll should come back immediately or after.
            // Usually unmount does it.
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!item) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
                    />

                    {/* Dialog Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4 md:p-6"
                    >
                        {/* Actual Dialog Content - separate click handler to stop propagation */}
                        <div
                            className="bg-[#111] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl relative pointer-events-auto flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all"
                            >
                                <X size={20} />
                            </button>

                            {/* Image Header */}
                            <div className="relative aspect-video w-full shrink-0">
                                <Image
                                    src={item.image || '/images/placeholder.png'}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-[#111] to-transparent opacity-80" />

                                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                                    <span className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold tracking-widest mb-4 border border-green-500/20">
                                        {item.category}
                                    </span>
                                    <h2 className="text-2xl md:text-4xl font-light text-white leading-tight mb-2">
                                        {item.title}
                                    </h2>
                                    <div className="flex items-center gap-2 text-white/50 text-sm">
                                        <Calendar size={14} />
                                        <span>{item.date}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 md:p-10 text-white/80 font-light leading-relaxed text-lg space-y-6">
                                <p className="whitespace-pre-line">
                                    {item.content}
                                </p>

                                <div className="pt-8 mt-8 border-t border-white/10 flex justify-end">
                                    <Link
                                        href={`/news/${item.id}`}
                                        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-green-300 transition-colors tracking-widest uppercase group"
                                    >
                                        Open full page <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
