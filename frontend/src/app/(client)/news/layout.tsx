import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'News & Updates',
    description: 'Stay updated with the latest news, awards, and announcements from 1931 Co., Ltd.',
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
