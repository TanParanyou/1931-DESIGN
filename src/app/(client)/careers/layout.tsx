import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Careers',
    description: 'Join our team at 1931 Co., Ltd. Explore current job openings and opportunities.',
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
