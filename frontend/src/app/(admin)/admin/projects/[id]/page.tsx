'use client';

import { use } from 'react';
import ProjectForm from '@/components/admin/ProjectForm';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditProjectPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const projectId = Number(resolvedParams.id);

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <ProjectForm isEdit projectId={projectId} />
        </div>
    );
}
