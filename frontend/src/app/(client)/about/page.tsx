'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl font-light tracking-wide mb-16 text-white"
            >
                {t.menu.ABOUT}
            </motion.h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl group"
                >
                    <Image
                        src="/images/slide1.png"
                        alt="About 1931"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="space-y-8 p-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md relative overflow-hidden"
                >
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                    <h2 className="text-3xl font-light tracking-wide text-white relative z-10">
                        {t.about.COMPANY_NAME}
                    </h2>
                    <div className="h-1 w-20 bg-linear-to-r from-green-500 to-transparent rounded-full" />

                    <p className="text-white/80 leading-loose font-light text-lg relative z-10">
                        {t.about.DESCRIPTION}
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
