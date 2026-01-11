'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { projectService } from '@/services/project.service';
import { Project } from '@/types/project';
import { Lightbox } from '@/components/ui/Lightbox';
import { Loading } from '@/components/ui/Loading';
import { motion } from 'framer-motion';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useLanguage();
    const id = Number(params?.id);

    const [project, setProject] = useState<Project | null>(null);
    const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    useEffect(() => {
        const loadProject = async () => {
            try {
                const proj = await projectService.getProject(id);
                if (!proj || !proj.is_active) {
                    router.push('/projects');
                    return;
                }
                setProject(proj);

                // Load related projects
                const allProjectsResponse = await projectService.getProjects(1, 100);
                const allProjects = (allProjectsResponse.data || []).filter(
                    (p: Project) => p.is_active
                );
                const related = allProjects
                    .filter((p: Project) => p.category === proj.category && p.id !== proj.id)
                    .slice(0, 3);
                setRelatedProjects(related);
            } catch (err) {
                console.error('Failed to load project:', err);
                router.push('/projects');
            } finally {
                setLoading(false);
            }
        };
        loadProject();
    }, [id, router]);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    if (loading) {
        return (
            <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen flex items-center justify-center">
                <Loading variant="orbit" size="xl" text={t.projects.LOADING} />
            </div>
        );
    }

    if (!project) {
        return null; // Handle null case or show specific 404
    }

    const coverImage = project.images?.[0] || '';
    const gallery = project.images || [];

    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-16"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-2 text-white">
                            {project.title}
                        </h1>
                        <p className="text-sm tracking-widest text-white/60">{project.location}</p>
                    </div>
                    <div className="text-sm tracking-widest px-6 py-2 border border-white/20 rounded-full text-white/80 bg-white/5">
                        {project.category}
                    </div>
                </div>
            </motion.div>

            {/* Main Image */}
            {coverImage && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative aspect-video w-full mb-16 rounded-3xl overflow-hidden cursor-pointer group border border-white/10 shadow-2xl"
                    onClick={() => openLightbox(0)}
                >
                    <Image
                        src={coverImage}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-black/60 backdrop-blur-md border border-white/10 px-8 py-4 text-sm tracking-[0.2em] text-white rounded-full">
                            {t.projects.VIEW_GALLERY}
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Description */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-24">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="lg:col-span-2 relative"
                >
                    {/* Decorative line */}
                    <div className="absolute -top-8 left-0 w-24 h-1 bg-linear-to-r from-green-500 to-transparent" />

                    <h2 className="text-xl font-medium tracking-[0.2em] mb-8 text-white">
                        {t.projects.DESCRIPTION}
                    </h2>
                    <p className="text-white/70 leading-relaxed text-lg font-light whitespace-pre-line">
                        {project.description || t.projects.NO_DESCRIPTION}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="space-y-6"
                >
                    {project.owner && (
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xs">
                            <h3 className="text-xs font-bold tracking-[0.2em] mb-3 text-green-400">
                                {t.projects.OWNER}
                            </h3>
                            <p className="text-white/90 font-light">{project.owner}</p>
                        </div>
                    )}
                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xs">
                        <h3 className="text-xs font-bold tracking-[0.2em] mb-3 text-green-400">
                            {t.projects.LOCATION}
                        </h3>
                        <p className="text-white/90 font-light">{project.location}</p>
                        {project.location_map_link && (
                            <a
                                href={project.location_map_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-white/50 hover:text-white mt-4 inline-flex items-center gap-2 transition-colors border-b border-white/20 pb-1"
                            >
                                {t.projects.VIEW_MAP} →
                            </a>
                        )}
                    </div>
                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xs">
                        <h3 className="text-xs font-bold tracking-[0.2em] mb-3 text-green-400">
                            {t.projects.STATUS}
                        </h3>
                        <p className="text-white/90 font-light">{project.status}</p>
                    </div>
                </motion.div>
            </div>

            {/* Gallery Grid */}
            {gallery.length > 1 && (
                <div className="mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-2xl font-light tracking-wide mb-12 text-white"
                    >
                        {t.projects.GALLERY}
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {gallery.map((img, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group border border-white/10"
                                onClick={() => openLightbox(index)}
                            >
                                <Image
                                    src={img}
                                    alt={`Gallery ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Related Projects */}
            {relatedProjects.length > 0 && (
                <div className="border-t border-white/10 pt-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-2xl font-light tracking-[0.2em] mb-16 text-white text-center"
                    >
                        {t.projects.RELATED}
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedProjects.map((related, index) => (
                            <motion.div
                                key={related.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <Link
                                    href={`/projects/${related.id}`}
                                    className="group cursor-pointer block"
                                >
                                    <div className="relative aspect-4/3 overflow-hidden rounded-2xl mb-6 border border-white/10 bg-white/5">
                                        {related.images?.[0] ? (
                                            <Image
                                                src={related.images[0]}
                                                alt={related.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-white/5" />
                                        )}
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />

                                        {/* Simple overlay for related projects */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-black/40 backdrop-blur-sm p-3 rounded-full border border-white/20">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-light tracking-wide text-white group-hover:text-green-400 transition-colors duration-300">
                                        {related.title}
                                    </h3>
                                    <p className="text-xs text-white/50 tracking-[0.2em] mt-2 group-hover:text-white/70 transition-colors">
                                        {related.location}
                                    </p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <Lightbox
                images={gallery.length > 0 ? gallery : [coverImage]}
                initialIndex={lightboxIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />
        </div>
    );
}
