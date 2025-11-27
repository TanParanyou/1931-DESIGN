"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { projects } from '@/lib/data';
import { useLanguage } from '@/lib/LanguageContext';

const categories = ["ALL", "RESIDENTIAL", "COMMERCIAL", "HOSPITALITY", "EDUCATION"];

export default function ProjectsPage() {
    const [activeCategory, setActiveCategory] = useState("ALL");
    const { t } = useLanguage();

    const filteredProjects = activeCategory === "ALL"
        ? projects
        : projects.filter(p => p.category === activeCategory);

    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-12 text-white">{t.projects.TITLE}</h1>

            {/* Filter */}
            <div className="flex flex-wrap gap-4 mb-16 border-b border-white/10 pb-8">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                            "px-6 py-2 rounded-full text-sm tracking-widest transition-all duration-300 border",
                            activeCategory === cat
                                ? "bg-white text-black border-white font-medium"
                                : "bg-transparent text-white/60 border-white/20 hover:border-white/50 hover:text-white"
                        )}
                    >
                        {cat === "ALL" ? t.projects.ALL : cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {filteredProjects.map((project) => (
                    <motion.div
                        key={project.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="group"
                    >
                        <Link href={`/projects/${project.id}`}>
                            <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-6 border border-white/10 shadow-lg">
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="glass px-6 py-3 rounded-full">
                                        <span className="text-xs tracking-widest text-white">VIEW DETAILS</span>
                                    </div>
                                </div>
                            </div>
                            <h3 className="text-xl font-light tracking-wide text-white group-hover:text-purple-300 transition-colors">{project.title}</h3>
                            <div className="flex justify-between items-center mt-2 border-t border-white/10 pt-2">
                                <p className="text-xs text-white/50 tracking-widest">{project.location}</p>
                                <p className="text-xs text-purple-300/70 tracking-widest">{project.category}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
