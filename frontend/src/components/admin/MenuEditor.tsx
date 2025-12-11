import React, { useEffect, useState } from 'react';
import { Menu, Permission, CreateMenuInput, UpdateMenuInput } from '@/types/rbac';
import { rbacService } from '@/services/rbac';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';

interface MenuEditorProps {
    menu?: Menu;
    onSave: () => void;
    onCancel: () => void;
}

export default function MenuEditor({ menu, onSave, onCancel }: MenuEditorProps) {
    const [title, setTitle] = useState(menu?.title || '');
    const [path, setPath] = useState(menu?.path || '');
    const [icon, setIcon] = useState(menu?.icon || '');
    const [permissionSlug, setPermissionSlug] = useState(menu?.permission_slug || '');
    const [order, setOrder] = useState(menu?.order || 0);
    const [loading, setLoading] = useState(false);

    // For Permission Selection (Optional)
    const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);

    useEffect(() => {
        loadPermissions();
    }, []);

    const loadPermissions = async () => {
        try {
            const data = await rbacService.getPermissions();
            setAvailablePermissions(data.permissions);
        } catch (error) {
            console.error('Failed to load permissions', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (menu) {
                await rbacService.updateMenu(menu.id, {
                    title,
                    path,
                    icon,
                    permission_slug: permissionSlug,
                    order: Number(order),
                });
            } else {
                await rbacService.createMenu({
                    title,
                    path,
                    icon,
                    permission_slug: permissionSlug,
                    order: Number(order),
                });
            }
            onSave();
        } catch (error) {
            console.error('Failed to save menu', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <Input
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Dashboard"
                    required
                />
                <Input
                    label="Path"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="e.g. /admin/dashboard"
                    required
                />
                <Input
                    label="Icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Lucide Icon Name (e.g. Home)"
                />

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                        Required Permission
                    </label>
                    <select
                        value={permissionSlug}
                        onChange={(e) => setPermissionSlug(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-500/50"
                    >
                        <option value="">None (Public/All Authenticated)</option>
                        {availablePermissions.map((p) => (
                            <option key={p.id} value={p.slug}>
                                {p.slug} ({p.description})
                            </option>
                        ))}
                    </select>
                </div>

                <Input
                    label="Order"
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    placeholder="0"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="outline" type="button" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={loading}>
                    {menu ? 'Save Changes' : 'Create Menu'}
                </Button>
            </div>
        </form>
    );
}
