import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us',
    description:
        'Learn more about 1931 Co., Ltd., our team, and our philosophy in architectural design.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
