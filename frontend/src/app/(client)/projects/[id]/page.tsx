'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { projectService } from '@/services/project.service';
import { Project } from '@/types/project';
import { Lightbox } from '@/components/ui/Lightbox';
import { Loader2 } from 'lucide-react';

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
                <Loader2 size={48} className="text-white/50 animate-spin" />
            </div>
        );
    }

    if (!project) {
        return null;
    }

    const coverImage = project.images?.[0] || '';
    const gallery = project.images || [];

    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            {/* Header */}
            <div className="mb-16">
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
            </div>

            {/* Main Image */}
            {coverImage && (
                <div
                    className="relative aspect-video w-full mb-16 rounded-2xl overflow-hidden cursor-pointer group border border-white/10 shadow-2xl"
                    onClick={() => openLightbox(0)}
                >
                    <Image
                        src={coverImage}
                        alt={project.title}
                        fill
                        className="object-cover transition-opacity group-hover:opacity-90"
                        priority
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="glass px-6 py-3 text-sm tracking-widest text-white rounded-full">
                            VIEW GALLERY
                        </span>
                    </div>
                </div>
            )}

            {/* Description */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-24">
                <div className="lg:col-span-2 glass p-8 md:p-12 rounded-2xl border-white/10 bg-black/20">
                    <h2 className="text-xl font-medium tracking-wide mb-6 text-green-200">
                        PROJECT DESCRIPTION
                    </h2>
                    <p className="text-white/80 leading-relaxed text-lg font-light">
                        {project.description || 'No description available.'}
                    </p>
                </div>
                <div className="space-y-6">
                    {project.owner && (
                        <div className="glass p-6 rounded-xl border-white/10 bg-black/20">
                            <h3 className="text-xs font-bold tracking-widest mb-2 text-green-300">
                                OWNER
                            </h3>
                            <p className="text-white/90">{project.owner}</p>
                        </div>
                    )}
                    <div className="glass p-6 rounded-xl border-white/10 bg-black/20">
                        <h3 className="text-xs font-bold tracking-widest mb-2 text-green-300">
                            LOCATION
                        </h3>
                        <p className="text-white/90">{project.location}</p>
                        {project.location_map_link && (
                            <a
                                href={project.location_map_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-400 hover:underline mt-2 inline-block"
                            >
                                View on Map →
                            </a>
                        )}
                    </div>
                    <div className="glass p-6 rounded-xl border-white/10 bg-black/20">
                        <h3 className="text-xs font-bold tracking-widest mb-2 text-green-300">
                            STATUS
                        </h3>
                        <p className="text-white/90">{project.status}</p>
                    </div>
                </div>
            </div>

            {/* Gallery Grid */}
            {gallery.length > 1 && (
                <div className="mb-24">
                    <h2 className="text-2xl font-light tracking-wide mb-8 text-white">GALLERY</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {gallery.map((img, index) => (
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
                    <h2 className="text-2xl font-light tracking-wide mb-12 text-white">
                        {t.projects.RELATED}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedProjects.map((related) => (
                            <Link
                                key={related.id}
                                href={`/projects/${related.id}`}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-4/3 overflow-hidden rounded-xl mb-4 border border-white/10">
                                    {related.images?.[0] ? (
                                        <Image
                                            src={related.images[0]}
                                            alt={related.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-white/5" />
                                    )}
                                </div>
                                <h3 className="text-lg font-medium tracking-wide text-white group-hover:text-green-300 transition-colors">
                                    {related.title}
                                </h3>
                                <p className="text-xs text-white/50 tracking-widest mt-1">
                                    {related.location}
                                </p>
                            </Link>
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
