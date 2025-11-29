"use client";

import React, { useEffect } from 'react';

import { useLanguage } from '@/lib/LanguageContext';
import { careers } from '@/lib/data';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CareersPage() {
    const { t } = useLanguage();
    const router = useRouter();

    useEffect(() => {
        router.push('/');
    }, [router]);

    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-16 text-white">{t.menu.CAREERS}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-1 glass p-8 rounded-2xl border-white/10 bg-black/20 h-fit">
                    <h2 className="text-xl font-medium tracking-wide mb-4 text-green-200">JOIN OUR TEAM</h2>
                    <p className="text-white/70 leading-relaxed mb-8">
                        We are always looking for passionate and talented individuals to join our growing team.
                        If you share our vision for creating exceptional spaces, we&apos;d love to hear from you.
                    </p>
                    <a href="mailto:careers@1931.com" className="text-sm tracking-widest border-b border-white/30 pb-1 hover:text-green-300 hover:border-green-300 transition-all text-white" onClick={() => router.push('/careers')}>
                        SEND YOUR PORTFOLIO
                    </a>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {careers.map((job) => (
                        <Link key={job.id} href={`/careers/${job.id}`} className="block glass p-8 rounded-2xl border-white/10 bg-black/20 hover:bg-white/5 transition-all group cursor-pointer">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex gap-4 text-xs tracking-widest text-white/50">
                                        <span>{job.type}</span>
                                        <span>|</span>
                                        <span>{job.location}</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-light tracking-wide text-white group-hover:text-green-300 transition-colors">
                                        {job.title}
                                    </h3>
                                </div>
                                <div className="text-sm tracking-widest border-b border-transparent group-hover:border-green-300 text-white/70 group-hover:text-green-300 transition-all">
                                    VIEW DETAILS
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
