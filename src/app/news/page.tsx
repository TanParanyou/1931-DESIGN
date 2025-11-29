
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { useLanguage } from '@/lib/LanguageContext';
import { news } from '@/lib/data';
import { useRouter } from 'next/router';

export default function NewsPage() {
    const { t } = useLanguage();

    const router = useRouter();
    useEffect(() => {
        router.push('/');
    }, []);

    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-16 text-white">{t.menu.NEWS}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
                {news.map((item) => (
                    <Link key={item.id} href={`/news/${item.id}`} className="group cursor-pointer block">
                        <div className="relative aspect-[3/2] rounded-xl mb-6 overflow-hidden border border-white/10 shadow-lg">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="glass px-6 py-3 rounded-full">
                                    <span className="text-xs tracking-widest text-white">READ MORE</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 px-2">
                            <span className="text-xs font-bold tracking-widest text-white/50">
                                {item.category} | {item.date}
                            </span>
                            <h2 className="text-xl md:text-2xl font-light tracking-wide text-white group-hover:text-purple-300 transition-colors">
                                {item.title}
                            </h2>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
