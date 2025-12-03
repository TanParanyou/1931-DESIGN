import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
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
