'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import UserForm from '@/components/admin/UserForm';

export default function CreateUserPage() {
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/admin/users"
                    className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                        Create New User
                    </h1>
                    <p className="text-gray-400 mt-1">Add a new user to the system</p>
                </div>
            </div>

            <UserForm />
        </div>
    );
}

