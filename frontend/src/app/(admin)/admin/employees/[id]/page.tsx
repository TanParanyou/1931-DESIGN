'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import EmployeeForm from '@/components/hr/EmployeeForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditEmployeePage() {
    const params = useParams();
    const router = useRouter();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployee = async () => {
            if (!params.id) return;
            try {
                const response = await api.get(`/hr/employees/${params.id}`);
                setEmployee(response.data);
            } catch (err) {
                console.error(err);
                router.push('/admin/employees');
            } finally {
                setLoading(false);
            }
        };

        fetchEmployee();
    }, [params.id, router]);

    if (loading) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/employees" className="inline-flex items-center text-gray-400 hover:text-white transition-colors gap-2 text-sm mb-4">
                    <ArrowLeft size={16} />
                    Back to Employees
                </Link>
                <h1 className="text-2xl font-bold text-white">Edit Employee</h1>
            </div>

            {employee && (
                <EmployeeForm
                    initialData={employee}
                    isEdit={true}
                    employeeId={params.id as string}
                />
            )}
        </div>
    );
}
