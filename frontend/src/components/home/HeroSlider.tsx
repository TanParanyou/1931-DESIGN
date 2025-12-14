'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '@/types/project';
import { Skeleton } from '@/components/ui/Loading';

interface HeroSliderProps {
    projects: Project[];
    isLoading?: boolean;
}

export const HeroSlider = ({ projects, isLoading = false }: HeroSliderProps) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const nextSlide = React.useCallback(() => {
        if (projects.length === 0) return;
        setCurrentSlide((prev) => (prev + 1) % projects.length);
    }, [projects.length]);

    const prevSlide = React.useCallback(() => {
        if (projects.length === 0) return;
        setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
    }, [projects.length]);

    useEffect(() => {
        if (projects.length === 0) return;
        const timer = setInterval(() => {
            nextSlide();
        }, 8000);
        return () => clearInterval(timer);
    }, [currentSlide, nextSlide, projects.length]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextSlide();
        }
        if (isRightSwipe) {
            prevSlide();
        }

        setTouchEnd(0);
        setTouchStart(0);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
                <div className="absolute inset-0">
                    <Skeleton className="w-full h-full" />
                </div>
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 text-center">
                    <div className="animate-pulse">
                        <Skeleton className="h-6 w-32 mx-auto mb-4" />
                        <Skeleton className="h-16 w-64 mx-auto" />
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (projects.length === 0) {
        return (
            <div className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
                <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/80" />
                <div className="relative z-10 text-center text-white">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-wider mb-4">
                        1931 DESIGN
                    </h1>
                    <p className="text-lg text-white/60 tracking-widest">ARCHITECTURE & DESIGN</p>
                </div>
            </div>
        );
    }

    const currentProject = projects[currentSlide];

    return (
        <div
            className="relative h-screen w-full overflow-hidden bg-black"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    className="absolute inset-0"
                >
                    <Image
                        src={currentProject.images?.[0] || '/images/placeholder.jpg'}
                        alt={currentProject.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/80" />
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-end text-end text-white z-10 px-4 pointer-events-none">
                <div className="px-0 py-12 md:px-16 md:py-20 rounded-2xl border-white/10  overflow-hidden relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: { staggerChildren: 0.2 },
                                },
                                exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
                            }}
                        >
                            <motion.h2
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: { duration: 0.8, ease: 'easeOut' },
                                    },
                                }}
                                className="text-sm md:text-lg tracking-[0.4em] uppercase mb-3 text-white font-medium"
                            >
                                {currentProject.category}
                            </motion.h2>
                            <motion.h1
                                variants={{
                                    hidden: { opacity: 0, scale: 0.95 },
                                    visible: {
                                        opacity: 1,
                                        scale: 1,
                                        transition: { duration: 0.8, ease: 'easeOut' },
                                    },
                                }}
                                className="text-4xl md:text-7xl lg:text-8xl font-bold tracking-wider mb-2 text-white whitespace-normal wrap-break-word leading-tight pb-2"
                            >
                                {currentProject.title}
                            </motion.h1>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation Arrows */}
            {projects.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all hidden md:block"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all hidden md:block"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </>
            )}

            {/* Progress Bar & Navigation */}
            {projects.length > 1 && (
                <div className="absolute bottom-12 left-0 right-0 z-20 flex flex-col items-center gap-6">
                    {/* Dots */}
                    <div className="flex justify-center gap-4">
                        {projects.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                    currentSlide === index
                                        ? 'bg-white w-8'
                                        : 'bg-white/30 w-4 hover:bg-white/60 cursor-pointer'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
