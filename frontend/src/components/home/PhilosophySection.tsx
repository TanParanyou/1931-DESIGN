'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export const PhilosophySection = () => {
    const { t } = useLanguage();

    return (
        <section className="relative py-32 px-6 w-full overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <h2 className="text-sm md:text-base tracking-[0.4em] text-green-500 mb-6 font-medium">
                            {t.home.PHILOSOPHY_TITLE}
                        </h2>
                        <h3 className="text-4xl md:text-6xl font-light leading-tight text-white mb-8">
                            {t.home.PHILOSOPHY_HEADLINE} <br />
                            <span className="text-white/50">{t.home.PHILOSOPHY_HEADLINE_SUB}</span>
                        </h3>
                        <div className="h-px w-24 bg-white/20" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        className="space-y-8"
                    >
                        <p className="text-lg text-white/70 leading-relaxed font-light">
                            {t.home.PHILOSOPHY_DESC_1}
                        </p>
                        <p className="text-lg text-white/70 leading-relaxed font-light">
                            {t.home.PHILOSOPHY_DESC_2}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-green-500/5 to-transparent pointer-events-none" />
        </section>
    );
};
