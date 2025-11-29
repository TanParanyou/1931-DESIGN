"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Architecture 
// Interior
// Built-in
// Renovate
// Landscape
// Construction

const slides = [
    {
        id: 1,
        image: '/images/slide1.png',
        title: 'ARCHITECTURE',
        subtitle: 'ARCHITECTURE PROJECT'
    },
    {
        id: 2,
        image: '/images/slide2.png',
        title: 'INTERIOR',
        subtitle: 'INTERIOR PROJECT'
    },
    {
        id: 3,
        image: '/images/slide3.png',
        title: 'BUILT-IN',
        subtitle: 'BUILT-IN PROJECT'
    },
    {
        id: 4,
        image: '/images/slide3.png',
        title: 'RENOVATE',
        subtitle: 'RENOVATE PROJECT'
    },
    {
        id: 5,
        image: '/images/slide3.png',
        title: 'LANDSCAPE',
        subtitle: 'LANDSCAPE PROJECT'
    },
    {
        id: 6,
        image: '/images/slide3.png',
        title: 'CONSTRUCTION',
        subtitle: 'CONSTRUCTION PROJECT'
    }
];



export const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black">
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <Image
                        src={slides[currentSlide].image}
                        alt={slides[currentSlide].title}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-end text-end text-white z-10 px-4 pointer-events-none">
                <div className="px-0 py-12 md:px-16 md:py-20 rounded-2xl border-white/10  overflow-hidden relative">
                    {/* Decorative Elements */}
                    {/* <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-white/20 rounded-tl-2xl" /> */}
                    {/* <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-white/20 rounded-br-2xl" /> */}

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
                                    transition: { staggerChildren: 0.2 }
                                },
                                exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
                            }}
                        >
                            <motion.h2
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
                                }}
                                className="text-sm md:text-lg tracking-[0.4em] uppercase mb-6 text-white font-medium"
                            >
                                {slides[currentSlide].subtitle}
                            </motion.h2>
                            <motion.h1
                                variants={{
                                    hidden: { opacity: 0, scale: 0.95 },
                                    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
                                }}
                                className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white"
                            >
                                {slides[currentSlide].title}
                            </motion.h1>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Progress Bar & Navigation */}
            <div className="absolute bottom-12 left-0 right-0 z-20 flex flex-col items-center gap-6">
                {/* Progress Bar */}
                {/* <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                        key={currentSlide}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 5, ease: "linear" }}
                        className="h-full bg-white/80"
                    />
                </div> */}

                {/* Dots */}
                <div className="flex justify-center gap-4">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${currentSlide === index ? 'bg-white w-8' : 'bg-white/30 w-2 hover:bg-white/60'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
