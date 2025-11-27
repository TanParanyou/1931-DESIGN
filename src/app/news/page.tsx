
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { useLanguage } from '@/lib/LanguageContext';
import { news } from '@/lib/data';

export default function NewsPage() {
    const { t } = useLanguage();
    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-16">{t.menu.NEWS}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16"> {/* Changed div class */}
                {news.map((item) => ( // Changed news to newsItems
                    <Link key={item.id} href={`/ news / ${item.id} `} className="group cursor-pointer block"> {/* Wrapped content in Link */}
                        <div className="relative aspect-[3/2] bg-gray-100 mb-6 overflow-hidden">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                        <div className="flex flex-col gap-2"> {/* Changed div class */}
                            <span className="text-xs font-bold tracking-widest text-gray-400"> {/* Changed div to span and updated classes */}
                                {item.category} | {item.date} {/* Combined date and category */}
                            </span>
                            <h2 className="text-xl md:text-2xl font-light tracking-wide group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors dark:text-white"> {/* Changed h3 to h2 and updated classes */}
                                {item.title}
                            </h2>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
