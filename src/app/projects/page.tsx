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
            <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-12">{t.projects.TITLE}</h1>

            {/* Filter */}
            <div className="flex flex-wrap gap-8 mb-16 border-b border-gray-100 pb-4">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                            "text-sm tracking-widest transition-colors hover:text-black",
                            activeCategory === cat ? "text-black font-medium" : "text-gray-400"
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group"
                    >
                        <Link href={`/projects/${project.id}`}>
                            <div className="relative aspect-[4/3] overflow-hidden mb-4 bg-gray-100">
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            </div>
                            <h3 className="text-lg font-medium tracking-wide">{project.title}</h3>
                            <p className="text-xs text-gray-500 tracking-widest mt-1">{project.location}</p>
                            <p className="text-xs text-gray-400 tracking-widest mt-1">{project.category}</p>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
