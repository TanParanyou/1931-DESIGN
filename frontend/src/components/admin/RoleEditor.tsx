import React, { useEffect, useState } from 'react';
import { Role, Permission } from '@/types/rbac';
import { rbacService } from '@/services/rbac';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { CheckCheck, XCircle } from 'lucide-react';

interface RoleEditorProps {
    role?: Role;
    onSave: () => void;
    onCancel: () => void;
}

export default function RoleEditor({ role, onSave, onCancel }: RoleEditorProps) {
    const [name, setName] = useState(role?.name || '');
    const [description, setDescription] = useState(role?.description || '');
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPermissions();
        if (role?.permissions) {
            setSelectedPermissions(role.permissions.map((p) => p.id));
        }
    }, [role]);

    const loadPermissions = async () => {
        try {
            const data = await rbacService.getPermissions();
            setPermissions(data.permissions);
        } catch (error) {
            console.error('Failed to load permissions', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (role) {
                // แก้ไข role ที่มีอยู่ - ส่ง permission_ids ไปด้วยเสมอ (รวมถึง empty array)
                await rbacService.updateRole(role.id, {
                    name,
                    description,
                    permission_ids: selectedPermissions,
                });
            } else {
                // สร้าง role ใหม่พร้อม permissions (ใช้ transaction ใน backend)
                await rbacService.createRole({
                    name,
                    description,
                    permission_ids: selectedPermissions,
                });
            }
            onSave();
        } catch (error) {
            console.error('Failed to save role', error);
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (id: number) => {
        setSelectedPermissions((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        );
    };

    // เลือกทั้งหมด
    const handleSelectAll = () => {
        setSelectedPermissions(permissions.map((p) => p.id));
    };

    // ไม่เลือกเลย
    const handleDeselectAll = () => {
        setSelectedPermissions([]);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <Input
                    label="Role Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Content Editor"
                    required
                />
                <Input
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Role description"
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-white/70">
                        Permissions ({selectedPermissions.length}/{permissions.length})
                    </label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        >
                            <CheckCheck size={14} />
                            เลือกทั้งหมด
                        </button>
                        <button
                            type="button"
                            onClick={handleDeselectAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <XCircle size={14} />
                            ไม่เลือกเลย
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-white/5 rounded-xl border border-white/10 max-h-60 overflow-y-auto">
                    {permissions.map((perm) => (
                        <label
                            key={perm.id}
                            className="flex items-start gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                        >
                            <Checkbox
                                checked={selectedPermissions.includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                            />
                            <div className="text-sm">
                                <span className="block text-white font-medium">{perm.slug}</span>
                                <span className="block text-white/50 text-xs">
                                    {perm.description}
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="outline" type="button" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={loading}>
                    {role ? 'Save Changes' : 'Create Role'}
                </Button>
            </div>
        </form>
    );
}
