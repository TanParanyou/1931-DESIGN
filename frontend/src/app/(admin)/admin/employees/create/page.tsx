'use client';

import EmployeeForm from '@/components/hr/EmployeeForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateEmployeePage() {
    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/employees" className="inline-flex items-center text-gray-400 hover:text-white transition-colors gap-2 text-sm mb-4">
                    <ArrowLeft size={16} />
                    Back to Employees
                </Link>
                <h1 className="text-2xl font-bold text-white">Add New Employee</h1>
            </div>

            <EmployeeForm />
        </div>
    );
}
