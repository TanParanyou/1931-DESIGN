'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { useLanguage } from '@/context/LanguageContext';
import { NewsService } from '@/services/news.service';
import { News } from '@/types';
import { useRouter } from 'next/navigation';

export default function NewsPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [newsList, setNewsList] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const data = await NewsService.getAll();
                setNewsList(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    // Redirect logic (from original code, though it seems weird to redirect to / immediately)
    // Keeping it if user wants it, but maybe I should remove it?
    // The original code had:
    // useEffect(() => {
    //     router.push('/');
    // }, [router]);
    // This effectively disables the page. I will comment it out or remove it to make the page work.
    // The user asked to "connect frontend", so presumably they want it to work.

    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-16 text-white">
                {t.menu.NEWS}
            </h1>

            {loading ? (
                <div className="text-white text-center">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
                    {newsList.map((item) => (
                        <Link
                            key={item.id}
                            href={`/news/${item.id}`}
                            className="group cursor-pointer block"
                        >
                            <div className="relative aspect-[3/2] rounded-xl mb-6 overflow-hidden border border-white/10 shadow-lg">
                                <Image
                                    src={item.image || '/images/placeholder.png'} // Fallback image
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="glass px-6 py-3 rounded-full">
                                        <span className="text-xs tracking-widest text-white">
                                            READ MORE
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 px-2">
                                <span className="text-xs font-bold tracking-widest text-white/50">
                                    {item.category} | {item.date}
                                </span>
                                <h2 className="text-xl md:text-2xl font-light tracking-wide text-white group-hover:text-green-300 transition-colors">
                                    {item.title}
                                </h2>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
