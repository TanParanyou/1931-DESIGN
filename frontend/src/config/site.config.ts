export type Locale = 'th' | 'en';

export type LocalizedText = {
    th: string;
    en: string;
};

export type SocialLinks = {
    line?: string;
    facebook?: string;
    instagram?: string;
    behance?: string;
    pinterest?: string;
    email?: string;
    twitter?: string;
    github?: string;
};

export type LogoConfig = {
    light: string;
    dark: string;
};

export type ThemeConfig = {
    colorPrimary: string;
    colorAccent: string;
};

export type SeoConfig = {
    titleTemplate: string;
    defaultTitle: string;
    defaultDescription: string;
    defaultOgImage: string;
    keywords: string[];
};

export type ContactInfo = {
    email?: string;
    phone?: string;
    address?: LocalizedText;
    googleMapUrl?: string;
};

export type BusinessInfo = {
    legalName?: string;
    registrationId?: string;
    taxId?: string;
};

export type IntegrationConfig = {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    metaPixelId?: string;
    sentryDsn?: string;
};

export type LayoutConfig = {
    containerWidth: 'narrow' | 'normal' | 'wide';
    headerStyle: 'minimal' | 'withBorder';
    footerStyle: 'minimal' | 'full';
    enableScrollAnimation: boolean;
};

export type FeatureFlags = {
    enableProjectsPage: boolean;
    enableBlog: boolean;
    showCookieBanner: boolean;
};

export type SiteConfig = {
    siteName: LocalizedText;
    siteShortName?: string;
    tagline?: LocalizedText;
    domain: string;

    defaultLocale: Locale;
    locales: Locale[];

    logo: LogoConfig;
    theme: ThemeConfig;

    social: SocialLinks;

    seo: SeoConfig;

    contact: ContactInfo;
    business?: BusinessInfo;

    layout: LayoutConfig;

    integrations?: IntegrationConfig;

    features: FeatureFlags;

    authors?: { name: string; url?: string }[];
    creator?: string;
};

export const siteConfig: SiteConfig = {
    siteName: {
        th: 'บริษัท 1931 จำกัด',
        en: '1931 Co., Ltd.',
    },
    siteShortName: '1931',
    tagline: {
        th: 'สตูดิโอออกแบบสถาปัตยกรรมและสเปซ',
        en: 'Architectural & Space Design Studio',
    },
    domain: 'https://1931-design.vercel.app',

    defaultLocale: 'th',
    locales: ['th', 'en'],

    logo: {
        light: '/images/logo-1931-light.svg',
        dark: '/images/logo-1931-dark.svg',
    },

    theme: {
        colorPrimary: '#111111',
        colorAccent: '#CDAA7D',
    },

    social: {
        // line: "https://lin.ee/xxxx",
        instagram: 'https://instagram.com/1931_studio', // Placeholder
        facebook: 'https://facebook.com/1931', // Placeholder
        email: 'info@1931.co.th', // Placeholder
        twitter: 'https://twitter.com/1931design',
        github: 'https://github.com/1931design',
    },

    seo: {
        titleTemplate: '%s | 1931 Co., Ltd.',
        defaultTitle: '1931 Co., Ltd. | Architectural Design Studio',
        defaultDescription:
            '1931 Co., Ltd. is a premier architectural design studio based in Thailand, specializing in modern, sustainable, and innovative architectural solutions.',
        defaultOgImage: 'https://1931-design.vercel.app/og.jpg',
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
    },

    contact: {
        email: 'info@1931.co.th',
        phone: '+66-92-518-9280',
        address: {
            th: '160/78 หมู่ 5 ถนนบางกรวย-ไทรน้อย ต.บางกรวย อ.บางกรวย จ.นนทบุรี 11130',
            en: '160/78 Moo 5, Bang Kruai-Sai Noi Rd., Bang Kruai, Nonthaburi 11130',
        },
        // googleMapUrl: "https://maps.app.goo.gl/xxxx",
    },

    business: {
        legalName: 'บริษัท 1931 จำกัด',
        // registrationId: "0105-xxxxxx",
        // taxId: "0105556xxxxx",
    },

    layout: {
        containerWidth: 'normal',
        headerStyle: 'minimal',
        footerStyle: 'minimal',
        enableScrollAnimation: true,
    },

    integrations: {
        googleAnalyticsId: '',
        googleTagManagerId: '',
        metaPixelId: '',
        sentryDsn: '',
    },

    features: {
        enableProjectsPage: true,
        enableBlog: false,
        showCookieBanner: true,
    },

    authors: [
        {
            name: '1931 Co., Ltd.',
            url: 'https://1931-design.vercel.app',
        },
    ],
    creator: '1931 Co., Ltd.',
};
