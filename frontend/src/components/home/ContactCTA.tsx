'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const ContactCTA = () => {
    const { t } = useLanguage();

    return (
        <section className="relative py-40 px-6 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/80 pointer-events-none" />

            <div className="max-w-5xl mx-auto relative z-10 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-sm md:text-base tracking-[0.4em] text-green-500 mb-8 font-medium"
                >
                    {t.home.CTA_SUBTITLE}
                </motion.h2>

                <motion.h3
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-light text-white mb-12 leading-tight"
                >
                    {t.home.CTA_TITLE} <br />
                    <span className="text-white/50">{t.home.CTA_TITLE_SUB}</span>
                </motion.h3>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Link
                        href="/contact"
                        className="group inline-flex items-center gap-4 bg-white text-black px-12 py-6 rounded-full text-lg tracking-widest font-medium hover:bg-green-400 transition-all duration-300"
                    >
                        {t.home.CTA_BUTTON}
                        <ArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};
