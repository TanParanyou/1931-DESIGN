'use client';

import { motion } from 'framer-motion';
import { Layers, PenTool, Ruler, Home } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const ServicesSection = () => {
    const { t } = useLanguage();

    const services = [
        {
            icon: <Layers className="w-8 h-8" />,
            title: t.home.SERVICES_ARCH_TITLE,
            description: t.home.SERVICES_ARCH_DESC,
        },
        {
            icon: <Home className="w-8 h-8" />,
            title: t.home.SERVICES_INTERIOR_TITLE,
            description: t.home.SERVICES_INTERIOR_DESC,
        },
        {
            icon: <Ruler className="w-8 h-8" />,
            title: t.home.SERVICES_CONST_TITLE,
            description: t.home.SERVICES_CONST_DESC,
        },
        {
            icon: <PenTool className="w-8 h-8" />,
            title: t.home.SERVICES_RENO_TITLE,
            description: t.home.SERVICES_RENO_DESC,
        },
    ];

    return (
        <section className="relative py-32 px-6 w-full bg-black/50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-sm md:text-base tracking-[0.4em] text-white/50 mb-4 font-medium"
                    >
                        {t.home.SERVICES_SUBTITLE}
                    </motion.h2>
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-3xl md:text-5xl font-light text-white"
                    >
                        {t.home.SERVICES_TITLE}
                    </motion.h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group p-8 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors duration-300 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                {service.icon}
                            </div>

                            <div className="relative z-10">
                                <div className="p-3 bg-white/10 w-fit rounded-xl mb-6 text-green-400 group-hover:text-green-300 transition-colors">
                                    {service.icon}
                                </div>
                                <h4 className="text-xl font-medium text-white mb-3 tracking-wide">
                                    {service.title}
                                </h4>
                                <p className="text-sm text-white/50 leading-relaxed">
                                    {service.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
