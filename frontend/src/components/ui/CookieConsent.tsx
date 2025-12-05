'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Link from 'next/link';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Small delay to make it feel natural
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent', 'true');
        setIsVisible(false);
    };

    const declineCookies = () => {
        localStorage.setItem('cookie-consent', 'false');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="glass bg-black/60 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <div className="flex-1 relative z-10">
                                <h3 className="text-xl font-light text-white mb-2">
                                    We value your privacy
                                </h3>
                                <p className="text-sm text-white/70 leading-relaxed max-w-2xl">
                                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                                    <Link href="/privacy-policy" className="ml-1 text-green-300 hover:text-white transition-colors underline decoration-green-300/30 underline-offset-4">
                                        Read our Privacy Policy
                                    </Link>
                                </p>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto relative z-10">
                                <button
                                    onClick={declineCookies}
                                    className="px-6 py-3 rounded-full border border-white/20 text-white/70 text-sm tracking-widest hover:bg-white/5 hover:text-white transition-all duration-300 w-full md:w-auto text-center"
                                >
                                    DECLINE
                                </button>
                                <button
                                    onClick={acceptCookies}
                                    className="px-8 py-3 rounded-full bg-white text-black text-sm font-bold tracking-widest hover:bg-green-300 transition-all duration-300 w-full md:w-auto text-center shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(134,239,172,0.4)]"
                                >
                                    ACCEPT ALL
                                </button>
                            </div>

                            <button
                                onClick={() => setIsVisible(false)}
                                className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors md:hidden"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
