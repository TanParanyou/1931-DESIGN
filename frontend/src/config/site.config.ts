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
    phone2?: string;
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
        instagram:
            'https://www.instagram.com/1931company?igsh=cjRoanFoNGJ1bnA3&utm_source=qr&ref=share', // Placeholder
        facebook: 'https://www.facebook.com/share/1BY4Sti3BB/?mibextid=wwXIfr&ref=share', // Placeholder
        email: 'ccontact.1931@gmail.com',
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
        email: 'ccontact.1931@gmail.com',
        phone: '+66-92-518-9280',
        phone2: '+66-85-046-0291',
        googleMapUrl:
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15498.120498178407!2d100.4832440407703!3d13.80717542324026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29b002b623bc9%3A0x3695b943ca86c45d!2s1931%20Company!5e0!3m2!1sen!2sth!4v1765484728388!5m2!1sen!2sth',
        address: {
            th: '160/78 หมู่ 5 ถนนบางกรวย-ไทรน้อย ต.บางกรวย อ.บางกรวย จ.นนทบุรี 11130',
            en: '160/78 Moo 5, Bang Kruai-Sai Noi Rd., Bang Kruai, Nonthaburi 11130',
        },
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
