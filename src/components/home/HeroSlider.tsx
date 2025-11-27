"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
    {
        id: 1,
        image: '/images/slide1.png',
        title: 'KNOWLEDGE IS EVERYWHERE',
        subtitle: 'EDUCATIONAL PROJECT'
    },
    {
        id: 2,
        image: '/images/slide2.png',
        title: 'DESIGN FOR LIFE',
        subtitle: 'RESIDENTIAL PROJECT'
    },
    {
        id: 3,
        image: '/images/slide3.png',
        title: 'URBAN HARMONY',
        subtitle: 'COMMERCIAL PROJECT'
    }
];

export const HeroSlider = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    <Image
                        src={slides[currentSlide].image}
                        alt={slides[currentSlide].title}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/20" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-10 px-4">
                <motion.h2
                    key={`sub-${currentSlide}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-sm md:text-base tracking-[0.3em] uppercase mb-4"
                >
                    {slides[currentSlide].subtitle}
                </motion.h2>
                <motion.h1
                    key={`title-${currentSlide}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-light tracking-wider"
                >
                    {slides[currentSlide].title}
                </motion.h1>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                            }`}
                    />
                ))}
            </div>

            {/* Arrows (Optional, keeping minimal for now but adding for usability) */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-20 hidden md:block"
            >
                <ChevronLeft size={48} strokeWidth={1} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-20 hidden md:block"
            >
                <ChevronRight size={48} strokeWidth={1} />
            </button>
        </div>
    );
};
