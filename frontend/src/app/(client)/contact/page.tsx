'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Copy, Check } from 'lucide-react';
import { useActionState } from 'react';
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
            <h1 className="text-4xl md:text-6xl font-light tracking-wide mb-16 text-white">
                {t.contact.TITLE}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Info */}
                <div className="space-y-12 glass p-10 rounded-2xl border-white/10 bg-black/20 h-fit">
                    <div>
                        <h3 className="text-sm font-bold tracking-widest mb-6 tx-green">
                            {t.contact.HEADQUARTERS}
                        </h3>
                        <div className="flex gap-4 items-start text-white/80 mb-4 group">
                            <MapPin size={20} className="mt-1 shrink-0 tx-green" />
                            <p className="leading-relaxed font-light whitespace-pre-line flex-1">
                                {address}
                            </p>
                            <button
                                onClick={handleCopyAddress}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                                title="Copy Address"
                            >
                                {addressCopied ? (
                                    <Check size={16} className="text-green-400" />
                                ) : (
                                    <Copy size={16} />
                                )}
                            </button>
                        </div>
                        <div className="flex gap-4 items-center text-white/80 mb-4">
                            <Phone size={20} className="shrink-0 tx-green" />
                            <a
                                href={`tel:${phone}`}
                                className="font-light hover:text-green-300 hover:border-green-300 transition-all"
                            >
                                {phone}
                            </a>
                        </div>
                        <div className="flex gap-4 items-center text-white/80 mb-4">
                            <Phone size={20} className="shrink-0 tx-green" />
                            <a
                                href={`tel:${phone2}`}
                                className="font-light hover:text-green-300 hover:border-green-300 transition-all"
                            >
                                {phone2}
                            </a>
                        </div>
                        <div className="flex gap-4 items-center text-white/80">
                            <Mail size={20} className="shrink-0 tx-green" />
                            <a
                                href={`mailto:${email}`}
                                className="font-light hover:text-green-300 hover:border-green-300 transition-all"
                            >
                                {email}
                            </a>
                        </div>
                    </div>

                    {/* <div>
                        <h3 className="text-sm font-bold tracking-widest mb-6 tx-green">
                            {t.contact.CAREERS}
                        </h3>
                        <p className="text-white/80 mb-4 font-light">
                            We are always looking for talented individuals to join our team.
                        </p>
                        <a
                            href={`mailto:${email}`}
                            className="tx-green border-b border-white/30 pb-1 hover:text-green-300 hover:border-green-300 transition-all"
                        >
                            {email}
                        </a>
                    </div> */}
                    <div className="text-white/80 font-light mb-2">Google Map</div>
                    <div className="w-full h-64 rounded-lg overflow-hidden border border-white/10">
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
                {/* Form */}
                {/* Form */}
                <div className="glass p-8 md:p-12 rounded-2xl border-white/10 bg-black/20">
                    <h3 className="text-xl font-light tracking-wide mb-8 text-white">
                        {t.contact.SEND_MESSAGE}
                    </h3>

                    {state.success ? (
                        <div className="text-center py-12 space-y-6">
                            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <h4 className="text-2xl text-white font-light">{t.contact.SUCCESS}</h4>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-white/60 hover:text-green-400 transition-colors border-b border-transparent hover:border-green-400 pb-1"
                            >
                                {t.contact.SEND}
                            </button>
                        </div>
                    ) : (
                        <form action={formAction} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold tracking-widest mb-2 text-white/60">
                                        {t.contact.NAME} <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        defaultValue={state.inputs?.name}
                                        className="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-green-400 transition-colors text-white"
                                    />
                                    {state.errors?.name && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {state.errors.name[0]}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold tracking-widest mb-2 text-white/60">
                                        {t.contact.EMAIL} <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        defaultValue={state.inputs?.email}
                                        className="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-green-400 transition-colors text-white"
                                    />
                                    {state.errors?.email && (
                                        <p className="text-red-400 text-xs mt-1">
                                            {state.errors.email[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold tracking-widest mb-2 text-white/60">
                                    {t.contact.SUBJECT} <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    required
                                    defaultValue={state.inputs?.subject}
                                    className="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-green-400 transition-colors text-white"
                                />
                                {state.errors?.subject && (
                                    <p className="text-red-400 text-xs mt-1">
                                        {state.errors.subject[0]}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold tracking-widest mb-2 text-white/60">
                                    {t.contact.MESSAGE} <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    name="message"
                                    rows={4}
                                    required
                                    defaultValue={state.inputs?.message}
                                    className="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-green-400 transition-colors resize-none text-white"
                                ></textarea>
                                {state.errors?.message && (
                                    <p className="text-red-400 text-xs mt-1">
                                        {state.errors.message[0]}
                                    </p>
                                )}
                            </div>

                            {state.message && !state.success && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-200 text-sm">
                                    {state.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="bg-white text-black px-8 py-3 text-sm tracking-widest hover:bg-green-300 transition-colors mt-4 rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                </div>
            </div>
        </div>
    );
}
