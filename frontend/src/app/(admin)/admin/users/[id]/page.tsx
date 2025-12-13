'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import UserForm from '@/components/admin/UserForm';

export default function EditUserPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const router = useRouter();
    const [initialLoading, setInitialLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [userData, setUserData] = useState<any>(null); // Using any temporarily for ease, can be strict

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get(`/users/${id}`);
            if (response.data.success) {
                setUserData(response.data.data.user);
            } else {
                setMessage({ type: 'error', text: 'Failed to fetch user' });
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: 'An error occurred fetching user details' });
        } finally {
            setInitialLoading(false);
        }
    };

    if (initialLoading) return <div className="p-8 text-white">Loading user details...</div>;
    if (message.type === 'error' && !userData)
        return <div className="p-8 text-red-400">{message.text}</div>;

    return (
        <div className="p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                            Edit User
                        </h1>
                        <p className="text-gray-400 mt-2">Update user details and permissions</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/admin/users')}>
                        Cancel
                    </Button>
                </div>

                {userData && <UserForm initialData={userData} isEdit={true} userId={id} />}
            </motion.div>
        </div>
    );
}
