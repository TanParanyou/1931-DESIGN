'use client';

import { useParams, notFound } from 'next/navigation';
import { NewsService } from '@/services/news.service';
import { News } from '@/types';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
// import { useLanguage } from '@/context/LanguageContext';

export default function NewsDetailPage() {
    const params = useParams();
    // const { t } = useLanguage();
    const id = Number(params?.id);
    const [item, setItem] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const data = await NewsService.getById(id);
                if (data) {
                    setItem(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    if (loading) return <div className="pt-32 text-center text-white">Loading...</div>;
    if (!item) {
        notFound();
    }

    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/news"
                    className="inline-flex items-center gap-2 text-sm tracking-widest text-white/50 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={16} />
                    BACK TO NEWS
                </Link>

                <div className="mb-8">
                    <span className="text-xs font-bold tracking-widest text-green-300 mb-4 block">
                        {item.category} | {item.date}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-light tracking-wide leading-tight text-white">
                        {item.title}
                    </h1>
                </div>

                <div className="relative aspect-video w-full mb-12 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <Image
                        src={item.image || '/images/placeholder.png'}
                        alt={item.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div className="glass p-8 md:p-12 rounded-2xl border-white/10 bg-black/20">
                    <div className="prose prose-lg max-w-none prose-invert">
                        <p className="text-white/80 leading-relaxed text-lg font-light">
                            {item.content}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
