import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LineStickyButton } from '@/components/ui/LineStickyButton';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <LineStickyButton />
        </>
    );
}
