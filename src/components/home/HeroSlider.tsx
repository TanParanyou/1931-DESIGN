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

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
};

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
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, x: 0 }}
                    transition={{ duration: 1.5 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);

                        if (swipe < -swipeConfidenceThreshold) {
                            nextSlide();
                        } else if (swipe > swipeConfidenceThreshold) {
                            prevSlide();
                        }
                    }}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                >
                    <Image
                        src={slides[currentSlide].image}
                        alt={slides[currentSlide].title}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-10 px-4 pointer-events-none">
                <motion.div
                    key={`content-${currentSlide}`}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="glass px-8 py-12 md:px-16 md:py-20 rounded-2xl border-white/10 bg-black/20"
                >
                    <h2 className="text-sm md:text-base tracking-[0.4em] uppercase mb-6 text-purple-200">
                        {slides[currentSlide].subtitle}
                    </h2>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-wider mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-white/80">
                        {slides[currentSlide].title}
                    </h1>
                </motion.div>
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-1 rounded-full transition-all duration-500 ${currentSlide === index ? 'bg-white w-12' : 'bg-white/30 w-4 hover:bg-white/60'
                            }`}
                    />
                ))}
            </div>

            {/* Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 md:p-4 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all z-20 group"
            >
                <ChevronLeft strokeWidth={1} className="w-8 h-8 md:w-12 md:h-12 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 md:p-4 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all z-20 group"
            >
                <ChevronRight strokeWidth={1} className="w-8 h-8 md:w-12 md:h-12 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
};
