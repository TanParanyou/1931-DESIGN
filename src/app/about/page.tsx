"use client";

import React from 'react';
import Image from 'next/image';

import { useLanguage } from '@/lib/LanguageContext';

export default function AboutPage() {
    const { t } = useLanguage();
    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-16 text-white">{t.menu.ABOUT}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <Image
                        src="/images/slide1.png"
                        alt="About 1931"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                <div className="space-y-8 glass p-10 rounded-2xl border-white/10 bg-black/20">
                    <h2 className="text-2xl font-light tracking-wide text-purple-200">1931 Co., Ltd.</h2>
                    <p className="text-white/80 leading-relaxed font-light text-lg">
                        The diversity of our team enables us to create a
                        broad range of architectural and Decoration styles. From
                        modern and striking, to contemporary and
                        traditional. We approach each project differently
                        and believe that each one should have its own
                        distinctive character.
                    </p>
                    {/* <p className="text-white/80 leading-relaxed font-light text-lg">
                        With over 80 years of experience, we have established ourselves as a leader in the industry,
                        delivering award-winning projects across residential, commercial, and public sectors.
                    </p> */}
                </div>
            </div>
        </div>
    );
}
