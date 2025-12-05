import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import CookieConsent from '@/components/ui/CookieConsent';
import GlobalAnnouncement from '@/components/ui/GlobalAnnouncement';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    metadataBase: new URL('https://1931-design.vercel.app'),
    title: {
        default: '1931 Co., Ltd. | Architectural Design Studio',
        template: '%s | 1931 Co., Ltd.',
    },
    description:
        '1931 Co., Ltd. is a premier architectural design studio based in Thailand, specializing in modern, sustainable, and innovative architectural solutions.',
    keywords: [
        'Architecture',
        'Design',
        'Interior Design',
        'Thailand',
        'Bangkok',
        'Sustainable Design',
        'Modern Architecture',
        '1931 Co., Ltd.',
        '1931 Design',
    ],
    authors: [{ name: '1931 Co., Ltd.' }],
    creator: '1931 Co., Ltd.',
    publisher: '1931 Co., Ltd.',
    applicationName: '1931 Co., Ltd.',
    appleWebApp: {
        title: '1931 Co., Ltd.',
        statusBarStyle: 'default',
    },
    openGraph: {
        title: '1931 Co., Ltd. | Architectural Design Studio',
        description:
            'Premier architectural design studio based in Thailand, specializing in modern, sustainable, and innovative architectural solutions.',
        url: 'https://1931-design.vercel.app',
        siteName: '1931 Co., Ltd.',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: '1931 Co., Ltd. | Architectural Design Studio',
        description: 'Premier architectural design studio based in Thailand.',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: '91skezEiIQj2fP0mJPnUxiWdbxwqs48P-kuXvEBtXxs',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    {children}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                '@context': 'https://schema.org',
                                '@type': 'ProfessionalService',
                                name: '1931 Co., Ltd.',
                                url: 'https://1931-design.vercel.app',
                                logo: 'https://1931-design.vercel.app/logo.png',
                                address: {
                                    '@type': 'PostalAddress',
                                    streetAddress: '160/78 Moo 5, Bang Kruai-Sai Noi Rd.',
                                    addressLocality: 'Bang Kruai',
                                    addressRegion: 'Nonthaburi',
                                    postalCode: '11130',
                                    addressCountry: 'TH',
                                },
                                contactPoint: {
                                    '@type': 'ContactPoint',
                                    telephone: '+66-92-518-9280',
                                    contactType: 'customer service',
                                },
                            }),
                        }}
                    />
                </Providers>
                <CookieConsent />
                <GlobalAnnouncement />
            </body>
        </html>
    );
}
