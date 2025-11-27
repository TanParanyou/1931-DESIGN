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
                        <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-2 dark:text-white">{project.title}</h1>
                        <p className="text-sm tracking-widest text-gray-500">{project.location} | {project.year}</p>
                    </div>
                    <div className="text-sm tracking-widest px-4 py-1 border border-black dark:border-white rounded-full dark:text-white">
                        {project.category}
                    </div>
                </div>
            </div>

            {/* Main Image */}
            <div
                className="relative aspect-video w-full mb-16 bg-gray-100 cursor-pointer group"
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
                    <span className="bg-black/50 text-white px-4 py-2 text-sm tracking-widest backdrop-blur-sm">VIEW GALLERY</span>
                </div>
            </div>

            {/* Description */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-24">
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-medium tracking-wide mb-6 dark:text-white">PROJECT DESCRIPTION</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                        {project.description}
                    </p>
                </div>
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xs font-bold tracking-widest mb-2 dark:text-white">CLIENT</h3>
                        <p className="text-gray-600 dark:text-gray-400">Confidential</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold tracking-widest mb-2 dark:text-white">AREA</h3>
                        <p className="text-gray-600 dark:text-gray-400">12,000 sq.m.</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold tracking-widest mb-2 dark:text-white">STATUS</h3>
                        <p className="text-gray-600 dark:text-gray-400">Completed</p>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            {project.gallery && project.gallery.length > 0 && (
                <div className="mb-24">
                    <h2 className="text-2xl font-light tracking-wide mb-8 dark:text-white">GALLERY</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {project.gallery.map((img, index) => (
                            <div
                                key={index}
                                className="relative aspect-square bg-gray-100 cursor-pointer overflow-hidden group"
                                onClick={() => openLightbox(index)}
                            >
                                <Image
                                    src={img}
                                    alt={`Gallery ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Related Projects */}
            {relatedProjects.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-16">
                    <h2 className="text-2xl font-light tracking-wide mb-12 dark:text-white">{t.projects.RELATED}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedProjects.map((related) => (
                            <Link key={related.id} href={`/projects/${related.id}`} className="group cursor-pointer">
                                <div className="relative aspect-[4/3] overflow-hidden mb-4 bg-gray-100">
                                    <Image
                                        src={related.image}
                                        alt={related.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <h3 className="text-lg font-medium tracking-wide dark:text-white">{related.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 tracking-widest mt-1">{related.location}</p>
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
