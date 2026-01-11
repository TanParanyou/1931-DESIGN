'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Copy, Check } from 'lucide-react';
import { useActionState } from 'react';
import { motion } from 'framer-motion';
import { sendContactEmail, ContactFormState } from './actions';
import { settingService } from '@/services/setting.service';
import { siteConfig } from '@/config/site.config';

const initialState: ContactFormState = {
    success: false,
    message: '',
    inputs: { name: '', email: '', subject: '', message: '' },
};

import { useLanguage } from '@/context/LanguageContext';

export default function ContactPage() {
    const { t } = useLanguage();
    const [state, formAction, isPending] = useActionState(sendContactEmail, initialState);
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [addressCopied, setAddressCopied] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await settingService.getPublicSettings();
            if (data && Object.keys(data).length > 0) {
                setSettings(data);
            }
        };
        fetchSettings();
    }, []);

    const getVal = (key: string, fallback: string) => settings[key] || fallback;

    // Default Fallbacks
    const defaultAddress =
        siteConfig.contact.address?.en ||
        '160 78 Bang Kruai,\nBang Kruai District,\nNonthaburi 11130';
    const defaultPhone = siteConfig.contact.phone || '+66 92 518 9280';
    const defaultPhone2 = siteConfig.contact.phone2 || '+66 85 046 0291';
    const defaultEmail = siteConfig.contact.email || 'ccontact.1931@gmail.com';
    const defaultMap =
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15498.120498178407!2d100.4832440407703!3d13.80717542324026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29b002b623bc9%3A0x3695b943ca86c45d!2s1931%20Company!5e0!3m2!1sen!2sth!4v1765484728388!5m2!1sen!2sth';

    const address = getVal('contact_address_en', defaultAddress);
    const phone = getVal('contact_phone', defaultPhone);
    const phone2 = getVal('contact_phone2', defaultPhone2);
    const email = getVal('contact_email', defaultEmail);
    const mapUrl = getVal('google_map_url', defaultMap);

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(address);
        setAddressCopied(true);
        setTimeout(() => setAddressCopied(false), 2000);
    };

    return (
        <div className="pt-32 pb-24 px-6 max-w-[1920px] mx-auto min-h-screen">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-6xl font-light tracking-wide mb-16 text-white"
            >
                {t.contact.TITLE}
            </motion.h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Info */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="space-y-12 p-8 md:p-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md h-fit"
                >
                    <div>
                        <h3 className="text-sm font-bold tracking-[0.2em] mb-8 text-green-400">
                            {t.contact.HEADQUARTERS}
                        </h3>
                        <div className="flex gap-4 items-start text-white/80 mb-6 group">
                            <MapPin size={20} className="mt-1 shrink-0 text-white/60 group-hover:text-green-400 transition-colors" />
                            <p className="leading-relaxed font-light whitespace-pre-line flex-1">
                                {address}
                            </p>
                            <button
                                onClick={handleCopyAddress}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                                title="Copy Address"
                            >
                                {addressCopied ? (
                                    <Check size={16} className="text-green-400" />
                                ) : (
                                    <Copy size={16} />
                                )}
                            </button>
                        </div>
                        <div className="flex gap-4 items-center text-white/80 mb-4 group">
                            <Phone size={20} className="shrink-0 text-white/60 group-hover:text-green-400 transition-colors" />
                            <a
                                href={`tel:${phone}`}
                                className="font-light hover:text-white transition-all border-b border-transparent hover:border-white pb-0.5"
                            >
                                {phone}
                            </a>
                        </div>
                        <div className="flex gap-4 items-center text-white/80 mb-4 group">
                            <Phone size={20} className="shrink-0 text-white/60 group-hover:text-green-400 transition-colors" />
                            <a
                                href={`tel:${phone2}`}
                                className="font-light hover:text-white transition-all border-b border-transparent hover:border-white pb-0.5"
                            >
                                {phone2}
                            </a>
                        </div>
                        <div className="flex gap-4 items-center text-white/80 group">
                            <Mail size={20} className="shrink-0 text-white/60 group-hover:text-green-400 transition-colors" />
                            <a
                                href={`mailto:${email}`}
                                className="font-light hover:text-white transition-all border-b border-transparent hover:border-white pb-0.5"
                            >
                                {email}
                            </a>
                        </div>
                    </div>

                    <div>
                        <div className="text-xs font-bold tracking-[0.2em] mb-6 text-white/40 uppercase">
                            {t.contact.MAP_LABEL}
                        </div>
                        <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/10 grayscale hover:grayscale-0 transition-all duration-700">
                            {mapUrl && (
                                <iframe
                                    id="map"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={mapUrl}
                                    title="Google Map"
                                ></iframe>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="p-8 md:p-12 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md"
                >
                    <h3 className="text-2xl font-light tracking-wide mb-10 text-white">
                        {t.contact.SEND_MESSAGE}
                    </h3>

                    {state.success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12 space-y-6"
                        >
                            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-10 w-10"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h4 className="text-3xl text-white font-light">{t.contact.SUCCESS}</h4>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-white/50 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1 mt-4"
                            >
                                {t.contact.SEND}
                            </button>
                        </motion.div>
                    ) : (
                        <form action={formAction} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="group">
                                    <label className="block text-xs font-bold tracking-[0.2em] mb-3 text-white/40 group-focus-within:text-green-400 transition-colors">
                                        {t.contact.NAME} <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        defaultValue={state.inputs?.name}
                                        className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-green-400 transition-colors text-white font-light text-lg"
                                        placeholder=""
                                    />
                                    {state.errors?.name && (
                                        <p className="text-red-400 text-xs mt-2">
                                            {state.errors.name[0]}
                                        </p>
                                    )}
                                </div>
                                <div className="group">
                                    <label className="block text-xs font-bold tracking-[0.2em] mb-3 text-white/40 group-focus-within:text-green-400 transition-colors">
                                        {t.contact.EMAIL} <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        defaultValue={state.inputs?.email}
                                        className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-green-400 transition-colors text-white font-light text-lg"
                                    />
                                    {state.errors?.email && (
                                        <p className="text-red-400 text-xs mt-2">
                                            {state.errors.email[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold tracking-[0.2em] mb-3 text-white/40 group-focus-within:text-green-400 transition-colors">
                                    {t.contact.SUBJECT} <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    required
                                    defaultValue={state.inputs?.subject}
                                    className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-green-400 transition-colors text-white font-light text-lg"
                                />
                                {state.errors?.subject && (
                                    <p className="text-red-400 text-xs mt-2">
                                        {state.errors.subject[0]}
                                    </p>
                                )}
                            </div>
                            <div className="group">
                                <label className="block text-xs font-bold tracking-[0.2em] mb-3 text-white/40 group-focus-within:text-green-400 transition-colors">
                                    {t.contact.MESSAGE} <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    name="message"
                                    rows={4}
                                    required
                                    minLength={10}
                                    defaultValue={state.inputs?.message}
                                    className="w-full bg-transparent border-b border-white/10 py-3 focus:outline-none focus:border-green-400 transition-colors resize-none text-white font-light text-lg leading-relaxed"
                                ></textarea>
                                <div className="text-right text-[10px] text-white/30 mt-2 uppercase tracking-wide">
                                    {t.contact.MESSAGE_HINT}
                                </div>
                                {state.errors?.message && (
                                    <p className="text-red-400 text-xs mt-2">
                                        {state.errors.message[0]}
                                    </p>
                                )}
                            </div>

                            {state.message && !state.success && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-center gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {state.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="bg-white text-black px-10 py-4 text-xs tracking-[0.2em] hover:bg-green-400 hover:text-black transition-all duration-300 mt-6 rounded-full font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 w-full md:w-auto uppercase"
                            >
                                {isPending ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                                        {t.contact.SENDING}
                                    </>
                                ) : (
                                    t.contact.SEND
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
