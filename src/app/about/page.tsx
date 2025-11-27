"use client";

import React from 'react';
import Image from 'next/image';

import { useLanguage } from '@/lib/LanguageContext';

export default function AboutPage() {
    const { t } = useLanguage();
    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-16">{t.menu.ABOUT}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="relative aspect-[4/3] w-full bg-gray-100">
                    <Image
                        src="/images/slide1.png"
                        alt="About 1938"
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="space-y-8">
                    <h2 className="text-2xl font-light tracking-wide">DESIGNING THE FUTURE SINCE 1938</h2>
                    <p className="text-gray-600 leading-relaxed">
                        1938 Co., Ltd. is a multidisciplinary design firm based in Bangkok, Thailand.
                        We believe in the power of architecture to shape lives and communities.
                        Our approach combines modern aesthetics with functional design, creating spaces that inspire and endure.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        With over 80 years of experience, we have established ourselves as a leader in the industry,
                        delivering award-winning projects across residential, commercial, and public sectors.
                    </p>
                </div>
            </div>
        </div>
    );
}
