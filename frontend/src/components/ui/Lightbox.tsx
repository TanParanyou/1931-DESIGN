'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface LightboxProps {
    images: string[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}



export const Lightbox: React.FC<LightboxProps> = ({ images, initialIndex, isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

    const nextImage = React.useCallback(
        (e?: React.MouseEvent) => {
            e?.stopPropagation();
            setCurrentIndex((prev) => (prev + 1) % images.length);
        },
        [images.length]
    );

    const prevImage = React.useCallback(
        (e?: React.MouseEvent) => {
            e?.stopPropagation();
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        },
        [images.length]
    );

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, prevImage, nextImage]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                    exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
                    onClick={onClose}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all z-50 cursor-pointer"
                    >
                        <X size={32} strokeWidth={1.5} />
                    </button>

                    {/* Navigation */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 md:left-8 p-4 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all z-50 cursor-pointer"
                            >
                                <ChevronLeft size={48} strokeWidth={1} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 md:right-8 p-4 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all z-50 cursor-pointer"
                            >
                                <ChevronRight size={48} strokeWidth={1} />
                            </button>
                        </>
                    )}

                    {/* Image */}
                    <div className="relative w-full h-full max-w-7xl max-h-[85vh] mx-4 md:mx-16 flex items-center justify-center">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ opacity: { duration: 0.2 } }}
                            className="relative w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <TransformWrapper
                                initialScale={1}
                                minScale={1}
                                maxScale={4}
                                centerOnInit
                            >
                                {({ zoomIn, zoomOut, resetTransform }) => (
                                    <>
                                        <div className="absolute bottom-6 right-6 flex gap-2 z-50">
                                            <button
                                                onClick={() => zoomIn()}
                                                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/10 cursor-pointer"
                                                title="Zoom In"
                                            >
                                                <ZoomIn size={20} strokeWidth={1.5} />
                                            </button>
                                            <button
                                                onClick={() => zoomOut()}
                                                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/10 cursor-pointer"
                                                title="Zoom Out"
                                            >
                                                <ZoomOut size={20} strokeWidth={1.5} />
                                            </button>
                                            <button
                                                onClick={() => resetTransform()}
                                                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/10 cursor-pointer"
                                                title="Reset"
                                            >
                                                <RotateCcw size={20} strokeWidth={1.5} />
                                            </button>
                                        </div>
                                        <TransformComponent
                                            wrapperStyle={{
                                                width: '100%',
                                                height: '100%',
                                            }}
                                            contentStyle={{
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <div className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
                                                <Image
                                                    src={images[currentIndex]}
                                                    alt={`Gallery image ${currentIndex + 1}`}
                                                    fill
                                                    className="object-contain"
                                                    priority
                                                    draggable={false}
                                                />
                                            </div>
                                        </TransformComponent>
                                    </>
                                )}
                            </TransformWrapper>
                        </motion.div>
                    </div>

                    {/* Counter */}
                    <div className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-sm tracking-widest">
                        {currentIndex + 1} / {images.length}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
