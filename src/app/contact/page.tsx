"use client";

import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

import { useLanguage } from '@/lib/LanguageContext';

export default function ContactPage() {
    const { t } = useLanguage();
    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-16">{t.contact.TITLE}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Info */}
                <div className="space-y-12">
                    <div>
                        <h3 className="text-sm font-bold tracking-widest mb-6">{t.contact.HEADQUARTERS}</h3>
                        <div className="flex gap-4 items-start text-gray-600 mb-4">
                            <MapPin size={20} className="mt-1 shrink-0" />
                            <p className="leading-relaxed">
                                123 Sukhumvit Road,<br />
                                Khlong Toei Nuea, Watthana,<br />
                                Bangkok 10110, Thailand
                            </p>
                        </div>
                        <div className="flex gap-4 items-center text-gray-600 mb-4">
                            <Phone size={20} className="shrink-0" />
                            <p>+66 2 123 4567</p>
                        </div>
                        <div className="flex gap-4 items-center text-gray-600">
                            <Mail size={20} className="shrink-0" />
                            <p>info@1938.com</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold tracking-widest mb-6">{t.contact.CAREERS}</h3>
                        <p className="text-gray-600 mb-4">
                            We are always looking for talented individuals to join our team.
                        </p>
                        <a href="mailto:careers@1938.com" className="text-black border-b border-black pb-1 hover:opacity-50 transition-opacity">
                            careers@1938.com
                        </a>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-gray-50 p-8 md:p-12">
                    <h3 className="text-xl font-light tracking-wide mb-8">{t.contact.SEND_MESSAGE}</h3>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold tracking-widest mb-2">{t.contact.NAME}</label>
                                <input type="text" className="w-full bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold tracking-widest mb-2">{t.contact.EMAIL}</label>
                                <input type="email" className="w-full bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold tracking-widest mb-2">{t.contact.SUBJECT}</label>
                            <input type="text" className="w-full bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold tracking-widest mb-2">{t.contact.MESSAGE}</label>
                            <textarea rows={4} className="w-full bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-black transition-colors resize-none"></textarea>
                        </div>
                        <button type="submit" className="bg-black text-white px-8 py-3 text-sm tracking-widest hover:bg-gray-800 transition-colors mt-4">
                            {t.contact.SEND}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
