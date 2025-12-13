import { Loading } from '@/components/ui/Loading';

export default function ClientLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loading variant="gradient" size="xl" text="กำลังโหลด..." />
        </div>
    );
}
