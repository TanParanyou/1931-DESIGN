'use client';

import { HeroSlider } from '@/components/home/HeroSlider';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { PhilosophySection } from '@/components/home/PhilosophySection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { ContactCTA } from '@/components/home/ContactCTA';
import { projectService } from '@/services/project.service';
import { Project } from '@/types/project';
import { Skeleton } from '@/components/ui/Loading';

export default function Home() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setIsLoading(true);
                // ดึง 4 projects แรก สำหรับแสดงในหน้าแรก
                const response = await projectService.getProjects(1, 4, undefined, true);
                setProjects(response.data || []);
            } catch (error) {
                console.error('Failed to fetch projects:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-black">
            <HeroSlider projects={projects} isLoading={isLoading} loadingText={t.projects.LOADING} />

            <PhilosophySection />

            <ServicesSection />

            <section className="relative py-32 px-6 w-full overflow-hidden">
                <div className="max-w-[1920px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div>
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="text-4xl md:text-5xl font-light tracking-wide text-white mb-4"
                            >
                                {t.home.SELECTED_PROJECTS}
                            </motion.h2>
                            <motion.div
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="h-1 w-24 bg-linear-to-r from-green-500 to-emerald-500 rounded-full origin-left"
                            />
                        </div>
                        <Link
                            href="/projects"
                            className="group flex items-center gap-2 text-sm tracking-[0.2em] text-white/70 hover:text-white transition-colors"
                        >
                            {t.home.VIEW_ALL}
                            <ArrowRight
                                size={16}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="animate-pulse">
                                    <Skeleton className="aspect-4/3 rounded-2xl mb-6" />
                                    <Skeleton className="h-8 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-white/50 text-lg">{t.home.NO_PROJECTS}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {projects.map((project, index) => (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                >
                                    <Link
                                        href={`/projects/${project.id}`}
                                        className="group cursor-pointer block"
                                    >
                                        <div className="relative aspect-4/3 overflow-hidden rounded-2xl mb-6 border border-white/10 shadow-2xl">
                                            <Image
                                                src={project.images?.[0] || '/images/placeholder.jpg'}
                                                alt={project.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />

                                            {/* Glass Card Overlay on Hover */}
                                            <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl text-center">
                                                    <span className="text-xs tracking-widest text-white font-medium">
                                                        {t.home.VIEW_PROJECT_BTN}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-light tracking-wide text-white group-hover:text-green-500 transition-colors">
                                            {project.title}
                                        </h3>
                                        <p className="text-sm text-white/50 tracking-[0.2em] mt-2">
                                            {project.location}
                                        </p>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <ContactCTA />
        </div>
    );
}
