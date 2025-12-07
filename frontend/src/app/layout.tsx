import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import ClientLayoutIntegrations from '@/components/layout/ClientLayoutIntegrations';
import { siteConfig } from '@/config/site.config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    metadataBase: new URL(siteConfig.domain),
    title: {
        default: siteConfig.seo.defaultTitle,
        template: siteConfig.seo.titleTemplate,
    },
    description: siteConfig.seo.defaultDescription,
    keywords: siteConfig.seo.keywords,
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    publisher: siteConfig.business?.legalName,
    applicationName: siteConfig.siteName.en,
    appleWebApp: {
        title: siteConfig.siteShortName,
        statusBarStyle: 'default',
    },
    openGraph: {
        title: siteConfig.seo.defaultTitle,
        description: siteConfig.seo.defaultDescription,
        url: siteConfig.domain,
        siteName: siteConfig.siteName.en,
        locale: 'en_US',
        type: 'website',
        images: [
            {
                url: siteConfig.seo.defaultOgImage,
                width: 1200,
                height: 630,
                alt: siteConfig.siteName.en,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: siteConfig.seo.defaultTitle,
        description: siteConfig.seo.defaultDescription,
        images: [siteConfig.seo.defaultOgImage],
        creator: siteConfig.social.twitter,
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
                                name: siteConfig.siteName.en,
                                alternateName: siteConfig.siteName.th,
                                url: siteConfig.domain,
                                logo: `${siteConfig.domain}${siteConfig.logo.light}`,
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
                                    telephone: siteConfig.contact.phone,
                                    contactType: 'customer service',
                                    email: siteConfig.contact.email,
                                },
                                sameAs: [
                                    siteConfig.social.facebook,
                                    siteConfig.social.instagram,
                                    siteConfig.social.twitter,
                                    siteConfig.social.github,
                                ].filter(Boolean),
                            }),
                        }}
                    />
                </Providers>
                <ClientLayoutIntegrations />
            </body>
        </html>
    );
}
