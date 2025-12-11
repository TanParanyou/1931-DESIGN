import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import ClientLayoutIntegrations from '@/components/layout/ClientLayoutIntegrations';
import { siteConfig } from '@/config/site.config';
import { settingService } from '@/services/setting.service';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
    const settings = await settingService.getPublicSettingsServer();

    // Default values from siteConfig if DB settings fail
    const title = settings?.site_title || siteConfig.seo.defaultTitle;
    const description = settings?.site_description || siteConfig.seo.defaultDescription;
    const siteName = settings?.site_title || siteConfig.siteName.en;

    return {
        metadataBase: new URL(siteConfig.domain),
        title: {
            default: title,
            template: `%s | ${siteName}`,
        },
        description: description,
        keywords: settings?.seo_keywords
            ? settings.seo_keywords.split(',').map((k) => k.trim())
            : siteConfig.seo.keywords,
        authors: siteConfig.authors,
        creator: siteConfig.creator,
        publisher: siteConfig.business?.legalName,
        applicationName: siteName,
        appleWebApp: {
            title: settings?.site_title || siteConfig.siteShortName,
            statusBarStyle: 'default',
        },
        openGraph: {
            title: title,
            description: description,
            url: siteConfig.domain,
            siteName: siteName,
            locale: 'en_US',
            type: 'website',
            images: [
                {
                    url: siteConfig.seo.defaultOgImage,
                    width: 1200,
                    height: 630,
                    alt: siteName,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [siteConfig.seo.defaultOgImage],
            creator: settings?.social_twitter || siteConfig.social.twitter,
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
}

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
