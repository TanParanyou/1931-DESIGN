'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { projectService } from '@/services/project.service';
import { Project, Category } from '@/types/project';
import { Loading } from '@/components/ui/Loading';

export default function ProjectsPage() {
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [projects, setProjects] = useState<Project[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [projectsResponse, cats] = await Promise.all([
                    projectService.getProjects(1, 100), // Get all projects
                    projectService.getCategories(),
                ]);
                // Filter only active projects
                const activeProjects = (projectsResponse.data || []).filter(
                    (p: Project) => p.is_active
                );
                setProjects(activeProjects);
                setCategories(cats);
            } catch (err) {
                console.error('Failed to load projects:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredProjects =
        activeCategory === 'ALL' ? projects : projects.filter((p) => p.category === activeCategory);

    if (loading) {
        return (
            <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen flex items-center justify-center">
                <Loading variant="orbit" size="xl" text={t.projects.LOADING} />
            </div>
        );
    }

    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl font-light tracking-wide mb-12 text-white"
            >
                {t.projects.TITLE}
            </motion.h1>

            {/* Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="flex flex-wrap gap-4 mb-16 border-b border-white/10 pb-8"
            >
                <button
                    onClick={() => setActiveCategory('ALL')}
                    className={cn(
                        'px-6 py-2 rounded-full text-sm tracking-widest transition-all duration-300 border relative overflow-hidden',
                        activeCategory === 'ALL'
                            ? 'bg-white text-black border-white font-medium shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                            : 'bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5'
                    )}
                >
                    {t.projects.ALL}
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.name)}
                        className={cn(
                            'px-6 py-2 rounded-full text-sm tracking-widest transition-all duration-300 border relative',
                            activeCategory === cat.name
                                ? 'bg-white text-black border-white font-medium shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                : 'bg-transparent text-white/60 border-white/10 hover:border-white/30 hover:text-white hover:bg-white/5'
                        )}
                    >
                        {cat.name}
                    </button>
                ))}
            </motion.div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project) => (
                        <motion.div
                            key={project.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="group"
                        >
                            <Link href={`/projects/${project.id}`}>
                                <div className="relative aspect-4/3 overflow-hidden rounded-2xl mb-6 border border-white/10 shadow-2xl bg-white/5">
                                    {project.images?.[0] ? (
                                        <Image
                                            src={project.images[0]}
                                            alt={project.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-white/5 flex items-center justify-center text-white/30 tracking-widest text-sm">
                                            NO IMAGE
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />

                                    {/* Glass Card Overlay on Hover - Matching Home Page Style */}
                                    <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl text-center">
                                            <span className="text-xs tracking-widest text-white font-medium">
                                                {t.projects.VIEW_DETAILS}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-light tracking-wide text-white group-hover:text-green-500 transition-colors duration-300">
                                    {project.title}
                                </h3>
                                <div className="flex justify-between items-center mt-3 border-t border-white/10 pt-3">
                                    <p className="text-xs text-white/50 tracking-[0.2em]">
                                        {project.location}
                                    </p>
                                    <p className="text-xs text-green-300/70 tracking-[0.2em] uppercase">
                                        {project.category}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredProjects.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32"
                >
                    <p className="text-white/30 text-lg tracking-widest font-light">
                        {t.projects.NO_PROJECTS_FOUND}
                    </p>
                </motion.div>
            )}
        </div>
    );
}
