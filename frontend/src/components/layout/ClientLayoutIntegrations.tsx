'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import GlobalAnnouncement from '@/components/ui/GlobalAnnouncement';

const CookieConsent = dynamic(() => import('@/components/ui/CookieConsent'), { ssr: false });

export default function ClientLayoutIntegrations() {
    const pathname = usePathname();

    const isHidden =
        pathname?.startsWith('/admin') ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname?.startsWith('/auth');

    if (isHidden) {
        return null;
    }

    return (
        <>
            <CookieConsent />
            <GlobalAnnouncement />
        </>
    );
}
