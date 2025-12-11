import React, { useEffect, useState } from 'react';
import { rbacService } from '@/services/rbac';
import { Role } from '@/types/rbac';
import RoleEditor from '@/components/admin/RoleEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);

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
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            await rbacService.deleteRole(id);
            fetchRoles();
        } catch (error) {
            alert('Failed to delete role (it might be in use)');
        }
    };

    const handleSave = async () => {
        // If we created a new role with permission selection, we might need to handle it here if the component didn't do it perfectly
        // But for now assume component handled it or we just refresh
        setIsEditorOpen(false);
        fetchRoles();

        // If it was a new role and we had selected permissions, we need to update it immediately?
        // Let's refine the RoleEditor logic later if needed.
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
                            <span className="text-white/70">{role.permissions?.length || 0}</span>{' '}
                            Permissions assigned
                        </div>
                    </div>
                ))}
            </div>

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
        </div>
    );
}
