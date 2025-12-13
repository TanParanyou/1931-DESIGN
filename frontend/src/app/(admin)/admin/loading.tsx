'use client';
import { Loading } from '@/components/ui/Loading';

export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loading variant="orbit" size="lg" text="Loading..." />
        </div>
    );
}
