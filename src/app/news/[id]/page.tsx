"use client";

import { useParams, notFound } from 'next/navigation';
import { news } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function NewsDetailPage() {
    const params = useParams();
    const { t } = useLanguage();
    const id = Number(params.id);
    const item = news.find(n => n.id === id);

    if (!item) {
        notFound();
    }

    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/news"
                    className="inline-flex items-center gap-2 text-sm tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={16} />
                    BACK TO NEWS
                </Link>

                <div className="mb-8">
                    <span className="text-xs font-bold tracking-widest text-gray-400 mb-4 block">
                        {item.category} | {item.date}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-light tracking-wide leading-tight dark:text-white">
                        {item.title}
                    </h1>
                </div>

                <div className="relative aspect-video w-full mb-12 bg-gray-100">
                    <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div className="prose prose-lg max-w-none dark:prose-invert">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                        {item.content}
                    </p>
                </div>
            </div>
        </div>
    );
}
