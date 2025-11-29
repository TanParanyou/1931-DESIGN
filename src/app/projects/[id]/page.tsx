"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { projects } from '@/lib/data';
import { useLanguage } from '@/lib/LanguageContext';

import { Lightbox } from '@/components/ui/Lightbox';
import { useState } from 'react';

export default function ProjectDetailPage() {
    const params = useParams();
    const { t } = useLanguage();
    const id = Number(params.id);
    const project = projects.find(p => p.id === id);

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    if (!project) {
        notFound();
    }

    // Filter related projects (same category, excluding current)
    const relatedProjects = projects
        .filter(p => p.category === project.category && p.id !== project.id)
        .slice(0, 3);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            {/* Header */}
            <div className="mb-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-2 text-white">{project.title}</h1>
                        <p className="text-sm tracking-widest text-white/60">{project.location} | {project.year}</p>
                    </div>
                    <div className="text-sm tracking-widest px-6 py-2 border border-white/20 rounded-full text-white/80 bg-white/5">
                        {project.category}
                    </div>
                </div>
            </div>

            {/* Main Image */}
            <div
                className="relative aspect-video w-full mb-16 rounded-2xl overflow-hidden cursor-pointer group border border-white/10 shadow-2xl"
                onClick={() => openLightbox(0)}
            >
                <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover transition-opacity group-hover:opacity-90"
                    priority
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="glass px-6 py-3 text-sm tracking-widest text-white rounded-full">VIEW GALLERY</span>
                </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-24">
                <div className="lg:col-span-2 glass p-8 md:p-12 rounded-2xl border-white/10 bg-black/20">
                    <h2 className="text-xl font-medium tracking-wide mb-6 text-green-200">PROJECT DESCRIPTION</h2>
                    <p className="text-white/80 leading-relaxed text-lg font-light">
                        {project.description}
                    </p>
                </div>
                <div className="space-y-6">
                    <div className="glass p-6 rounded-xl border-white/10 bg-black/20">
                        <h3 className="text-xs font-bold tracking-widest mb-2 text-green-300">CLIENT</h3>
                        <p className="text-white/90">Confidential</p>
                    </div>
                    <div className="glass p-6 rounded-xl border-white/10 bg-black/20">
                        <h3 className="text-xs font-bold tracking-widest mb-2 text-green-300">AREA</h3>
                        <p className="text-white/90">12,000 sq.m.</p>
                    </div>
                    <div className="glass p-6 rounded-xl border-white/10 bg-black/20">
                        <h3 className="text-xs font-bold tracking-widest mb-2 text-green-300">STATUS</h3>
                        <p className="text-white/90">Completed</p>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            {project.gallery && project.gallery.length > 0 && (
                <div className="mb-24">
                    <h2 className="text-2xl font-light tracking-wide mb-8 text-white">GALLERY</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {project.gallery.map((img, index) => (
                            <div
                                key={index}
                                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-white/10"
                                onClick={() => openLightbox(index)}
                            >
                                <Image
                                    src={img}
                                    alt={`Gallery ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Related Projects */}
            {relatedProjects.length > 0 && (
                <div className="border-t border-white/10 pt-16">
                    <h2 className="text-2xl font-light tracking-wide mb-12 text-white">{t.projects.RELATED}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedProjects.map((related) => (
                            <Link key={related.id} href={`/projects/${related.id}`} className="group cursor-pointer">
                                <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-4 border border-white/10">
                                    <Image
                                        src={related.image}
                                        alt={related.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <h3 className="text-lg font-medium tracking-wide text-white group-hover:text-green-300 transition-colors">{related.title}</h3>
                                <p className="text-xs text-white/50 tracking-widest mt-1">{related.location}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <Lightbox
                images={project.gallery || [project.image]}
                initialIndex={lightboxIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />
        </div>
    );
}
