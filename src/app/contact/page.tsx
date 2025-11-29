"use client";

import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

import { useLanguage } from '@/lib/LanguageContext';

export default function ContactPage() {
    const { t } = useLanguage();
    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-16 text-white">{t.contact.TITLE}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Info */}
                <div className="space-y-12 glass p-10 rounded-2xl border-white/10 bg-black/20 h-fit">
                    <div>
                        <h3 className="text-sm font-bold tracking-widest mb-6 text-purple-300">{t.contact.HEADQUARTERS}</h3>
                        <div className="flex gap-4 items-start text-white/80 mb-4">
                            <MapPin size={20} className="mt-1 shrink-0 text-purple-400" />
                            <p className="leading-relaxed font-light">
                                160/78 หมู่ที่ 5 ถนนบางกรวย-ไทรน้อย<br />
                                ตำบลบางกรวย อำเภอบางกรวย<br />
                                จ.นนทบุรี 11130
                            </p>
                        </div>
                        <div className="flex gap-4 items-center text-white/80 mb-4">
                            <Phone size={20} className="shrink-0 text-purple-400" />
                            <p className="font-light">+66 92 518 9280</p>
                        </div>
                        <div className="flex gap-4 items-center text-white/80 mb-4">
                            <Phone size={20} className="shrink-0 text-purple-400" />
                            <p className="font-light">+66 85 046 0291</p>
                        </div>
                        <div className="flex gap-4 items-center text-white/80">
                            <Mail size={20} className="shrink-0 text-purple-400" />
                            <p className="font-light">ccontact.1931@gmail.com</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold tracking-widest mb-6 text-purple-300">{t.contact.CAREERS}</h3>
                        <p className="text-white/80 mb-4 font-light">
                            We are always looking for talented individuals to join our team.
                        </p>
                        <a href="mailto:ccontact.1931@gmail.com" className="text-white border-b border-white/30 pb-1 hover:text-purple-300 hover:border-purple-300 transition-all">
                            ccontact.1931@gmail.com
                        </a>
                    </div>

                    <div className="w-full h-64 rounded-lg overflow-hidden border border-white/10">
                        <iframe
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src="https://maps.google.com/maps?q=160%2F78+หมู่ที่+5+ถนนบางกรวย-ไทรน้อย+ตำบลบางกรวย+อำเภอบางกรวย+จ.นนทบุรี+11130&t=&z=15&ie=UTF8&iwloc=&output=embed"
                            title="Google Map"
                        ></iframe>
                    </div>
                </div>

                {/* Form */}
                <div className="glass p-8 md:p-12 rounded-2xl border-white/10 bg-black/20">
                    <h3 className="text-xl font-light tracking-wide mb-8 text-white">{t.contact.SEND_MESSAGE}</h3>
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold tracking-widest mb-2 text-white/60">{t.contact.NAME}</label>
                                <input type="text" className="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-purple-400 transition-colors text-white" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold tracking-widest mb-2 text-white/60">{t.contact.EMAIL}</label>
                                <input type="email" className="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-purple-400 transition-colors text-white" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold tracking-widest mb-2 text-white/60">{t.contact.SUBJECT}</label>
                            <input type="text" className="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-purple-400 transition-colors text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold tracking-widest mb-2 text-white/60">{t.contact.MESSAGE}</label>
                            <textarea rows={4} className="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-purple-400 transition-colors resize-none text-white"></textarea>
                        </div>
                        <button type="submit" className="bg-white text-black px-8 py-3 text-sm tracking-widest hover:bg-purple-300 transition-colors mt-4 rounded-full font-medium">
                            {t.contact.SEND}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
