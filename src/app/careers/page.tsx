"use client";

import React from 'react';

import { useLanguage } from '@/lib/LanguageContext';
import { careers } from '@/lib/data';
import Link from 'next/link';

const positions = [
    { id: 1, title: "SENIOR ARCHITECT", type: "FULL TIME", location: "BANGKOK" },
    { id: 2, title: "INTERIOR DESIGNER", type: "FULL TIME", location: "BANGKOK" },
    { id: 3, title: "JUNIOR ARCHITECT", type: "FULL TIME", location: "PHUKET" },
    { id: 4, title: "DRAFTSMAN", type: "CONTRACT", location: "BANGKOK" },
];

export default function CareersPage() {
    const { t } = useLanguage();
    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-16">{t.menu.CAREERS}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-medium tracking-wide mb-4">JOIN OUR TEAM</h2>
                    <p className="text-gray-600 leading-relaxed mb-8">
                        We are always looking for passionate and talented individuals to join our growing team.
                        If you share our vision for creating exceptional spaces, we'd love to hear from you.
                    </p>
                    <a href="mailto:careers@1938.com" className="text-sm tracking-widest border-b border-black pb-1 hover:opacity-50 transition-opacity">
                        SEND YOUR PORTFOLIO
                    </a>
                </div>

                <div className="lg:col-span-2 space-y-8"> {/* Changed space-y-6 to space-y-8 */}
                    {careers.map((job) => (
                        <Link key={job.id} href={`/careers/${job.id}`} className="block border-b border-gray-100 dark:border-gray-800 pb-8 group cursor-pointer">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex gap-4 text-xs tracking-widest text-gray-400">
                                        <span>{job.type}</span>
                                        <span>|</span> {/* Changed • to | */}
                                        <span>{job.location}</span>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-light tracking-wide group-hover:text-gray-500 dark:group-hover:text-gray-300 transition-colors dark:text-white">
                                        {job.title}
                                    </h3>
                                </div>
                                <div className="text-sm tracking-widest border-b border-transparent group-hover:border-black dark:group-hover:border-white transition-all dark:text-white">
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
