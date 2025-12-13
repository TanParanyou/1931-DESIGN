'use client';

import React, { useEffect, useState } from 'react';
import { rbacService } from '@/services/rbac';
import { Role } from '@/types/rbac';
import RoleEditor from '@/components/admin/RoleEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Plus, Edit2, Trash2, Shield, X, Users } from 'lucide-react';
import { Loading } from '@/components/ui/Loading';
import { useConfirm, Modal } from '@/components/ui/Modal';

interface RoleUser {
    id: number;
    email: string;
    name: string;
    created_at: string;
}

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);

    // สำหรับแสดง users ที่ใช้ role
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
    const [selectedRoleName, setSelectedRoleName] = useState('');
    const [roleUsers, setRoleUsers] = useState<RoleUser[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // useConfirm hook สำหรับ delete
    const { confirm, ConfirmDialog } = useConfirm();

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const data = await rbacService.getRoles();
            setRoles(data.roles);
        } catch (error) {
            console.error('Failed to fetch roles', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleCreate = () => {
        setEditingRole(undefined);
        setIsEditorOpen(true);
    };

    const handleEdit = (role: Role) => {
        setEditingRole(role);
        setIsEditorOpen(true);
    };

    const handleDelete = async (id: number) => {
        const confirmed = await confirm({
            title: 'ยืนยันการลบ',
            message: 'คุณต้องการลบ Role นี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
            variant: 'danger',
            confirmText: 'ลบ',
            cancelText: 'ยกเลิก',
        });

        if (!confirmed) return;

        try {
            await rbacService.deleteRole(id);
            fetchRoles();
        } catch (error) {
            // TODO: อาจใช้ AlertModal แทน alert
            alert('Failed to delete role (it might be in use)');
        }
    };

    const handleSave = async () => {
        setIsEditorOpen(false);
        fetchRoles();
    };

    // แสดง users ที่ใช้ role นี้
    const handleViewUsers = async (role: Role) => {
        setSelectedRoleName(role.name);
        setLoadingUsers(true);
        setIsUsersModalOpen(true);

        try {
            const data = await rbacService.getRoleUsers(role.id);
            setRoleUsers(data.users || []);
        } catch (error) {
            console.error('Failed to fetch role users', error);
            setRoleUsers([]);
        } finally {
            setLoadingUsers(false);
        }
    };

    return (
        <div className="p-6 md:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-light text-white mb-2">Role Management</h1>
                    <p className="text-white/50">Manage system roles and permissions</p>
                </div>
                <Button onClick={handleCreate} icon={<Plus size={18} />}>
                    Create Role
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <Loading variant="pulse" size="lg" text="กำลังโหลด..." />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {roles.map((role) => (
                        <div
                            key={role.id}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                                    <Shield size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleViewUsers(role)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-cyan-400 transition-colors"
                                        title="ดูผู้ใช้งาน"
                                    >
                                        <Users size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(role)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(role.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-white/70 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-medium text-white mb-2">{role.name}</h3>
                            <p className="text-white/50 text-sm mb-6 h-10 line-clamp-2">
                                {role.description}
                            </p>

                            <div className="flex items-center gap-2 text-xs font-medium text-white/40 bg-black/20 p-3 rounded-lg">
                                <span className="text-white/70">
                                    {role.permissions?.length || 0}
                                </span>{' '}
                                Permissions assigned
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Overlay for Editor */}
            <AnimatePresence>
                {isEditorOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditorOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
                        >
                            <div
                                className="bg-[#111] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl pointer-events-auto p-6 md:p-8"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-light text-white">
                                        {editingRole ? 'Edit Role' : 'Create Role'}
                                    </h2>
                                    <button
                                        onClick={() => setIsEditorOpen(false)}
                                        className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <RoleEditor
                                    role={editingRole}
                                    onSave={handleSave}
                                    onCancel={() => setIsEditorOpen(false)}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Modal for displaying users in role */}
            <Modal
                isOpen={isUsersModalOpen}
                onClose={() => setIsUsersModalOpen(false)}
                title={`ผู้ใช้งาน Role: ${selectedRoleName}`}
                description="รายการผู้ใช้งานที่ใช้ Role นี้"
                size="md"
            >
                {loadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                        <Loading variant="dots" size="md" text="กำลังโหลด..." />
                    </div>
                ) : roleUsers.length === 0 ? (
                    <div className="text-center py-8">
                        <Users size={48} className="mx-auto text-white/20 mb-4" />
                        <p className="text-white/50">ไม่มีผู้ใช้งานที่ใช้ Role นี้</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-white/50 mb-4">
                            พบผู้ใช้งาน {roleUsers.length} คน
                        </p>
                        <div className="max-h-80 overflow-y-auto space-y-2">
                            {roleUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                                >
                                    <div>
                                        <p className="text-white font-medium">
                                            {user.name || 'ไม่ระบุชื่อ'}
                                        </p>
                                        <p className="text-white/50 text-sm">{user.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirm Dialog */}
            <ConfirmDialog />
        </div>
    );
}
