'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import GlobalAnnouncement from '@/components/ui/GlobalAnnouncement';
import { useEffect, useState } from 'react';
import { settingService } from '@/services/setting.service';
import { siteConfig } from '@/config/site.config';
import Script from 'next/script';

const CookieConsent = dynamic(() => import('@/components/ui/CookieConsent'), { ssr: false });

export default function ClientLayoutIntegrations() {
    const pathname = usePathname();
    const [settings, setSettings] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await settingService.getPublicSettings();
            if (data && Object.keys(data).length > 0) {
                setSettings(data);
            }
        };
        fetchSettings();
    }, []);

    const isHidden =
        pathname?.startsWith('/admin') ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname?.startsWith('/auth');

    if (isHidden) {
        return null;
    }

    // Analytics IDs (DB >> Config >> null)
    const gaId = settings.analytics_google_id || siteConfig.integrations?.googleAnalyticsId;
    const gtmId = settings.analytics_gtm_id || siteConfig.integrations?.googleTagManagerId;
    const pixelId = settings.analytics_pixel_id || siteConfig.integrations?.metaPixelId;

    return (
        <>
            <CookieConsent />
            <GlobalAnnouncement />

            {/* Google Tag Manager */}
            {gtmId && (
                <Script id="google-tag-manager" strategy="afterInteractive">
                    {`
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','${gtmId}');
                    `}
                </Script>
            )}

            {/* Google Analytics */}
            {gaId && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                        strategy="afterInteractive"
                    />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${gaId}');
                        `}
                    </Script>
                </>
            )}

            {/* Meta Pixel */}
            {pixelId && (
                <Script id="meta-pixel" strategy="afterInteractive">
                    {`
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '${pixelId}');
                        fbq('track', 'PageView');
                    `}
                </Script>
            )}
        </>
    );
}
