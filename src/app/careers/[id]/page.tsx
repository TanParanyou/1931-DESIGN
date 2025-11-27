"use client";

import { useParams, notFound } from 'next/navigation';
import { careers } from '@/lib/data';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
// import { useLanguage } from '@/lib/LanguageContext';

export default function CareerDetailPage() {
    const params = useParams();
    // const { t } = useLanguage();
    const id = Number(params.id);
    const job = careers.find(c => c.id === id);

    if (!job) {
        notFound();
    }

    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/careers"
                    className="inline-flex items-center gap-2 text-sm tracking-widest text-white/50 hover:text-white transition-colors mb-12"
                >
                    <ArrowLeft size={16} />
                    BACK TO CAREERS
                </Link>

                <div className="border-b border-white/10 pb-8 mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-light tracking-wide mb-4 text-white">{job.title}</h1>
                            <div className="flex gap-4 text-sm tracking-widest text-white/60">
                                <span>{job.type}</span>
                                <span>|</span>
                                <span>{job.location}</span>
                            </div>
                        </div>
                        <a
                            href={`mailto:careers@1938.com?subject=Application for ${job.title}`}
                            className="inline-block bg-white text-black px-8 py-3 text-sm tracking-widest hover:bg-purple-300 transition-colors text-center rounded-full font-medium"
                        >
                            APPLY NOW
                        </a>
                    </div>
                </div>

                <div className="space-y-8 glass p-10 rounded-2xl border-white/10 bg-black/20">
                    <div>
                        <h2 className="text-lg font-bold tracking-widest mb-4 text-purple-300">DESCRIPTION</h2>
                        <p className="text-white/80 leading-relaxed font-light">
                            {job.description}
                        </p>
                    </div>

                    {job.responsibilities && (
                        <div>
                            <h2 className="text-lg font-bold tracking-widest mb-4 text-purple-300">RESPONSIBILITIES</h2>
                            <ul className="list-disc list-inside space-y-2 text-white/80 leading-relaxed font-light">
                                {job.responsibilities.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {job.requirements && (
                        <div>
                            <h2 className="text-lg font-bold tracking-widest mb-4 text-purple-300">REQUIREMENTS</h2>
                            <ul className="list-disc list-inside space-y-2 text-white/80 leading-relaxed font-light">
                                {job.requirements.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
