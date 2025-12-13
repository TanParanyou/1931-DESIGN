'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { DataTable, Column } from '@/components/ui/DataTable';
import { FormModal, useModal, useConfirm } from '@/components/ui/Modal';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { useDataTable } from '@/hooks/useDataTable';
import { Plus, Edit2, Trash2, Briefcase, Building } from 'lucide-react';
import { PageLoading } from '@/components/ui/Loading';

interface Department {
    id: number;
    name: string;
}

interface Position {
    id: number;
    name: string;
    description: string;
    department_id?: number;
    department?: Department;
    is_active: boolean;
}

export default function PositionsPage() {
    const [editingPos, setEditingPos] = useState<Position | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [saving, setSaving] = useState(false);
    const { isOpen, open, close } = useModal();
    const { confirm, ConfirmDialog } = useConfirm();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        department_id: '',
        is_active: true,
    });

    // Fetch departments for dropdown
    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await api.get('/hr/departments?active=true');
                setDepartments(res.data.data || []);
            } catch (err) {
                console.error('Failed to fetch departments', err);
            }
        };
        fetchDepts();
    }, []);

    // Data fetcher
    const fetchPositions = useCallback(async () => {
        const res = await api.get('/hr/positions');
        return {
            data: res.data.data || [],
            total: res.data.data?.length || 0,
        };
    }, []);

    const {
        data: positions,
        isLoading,
        fetchData,
    } = useDataTable<Position>({
        fetcher: fetchPositions,
        initialPagination: { limit: 100 },
    });

    const handleCreate = () => {
        setEditingPos(null);
        setFormData({ name: '', description: '', department_id: '', is_active: true });
        open();
    };

    const handleEdit = (pos: Position) => {
        setEditingPos(pos);
        setFormData({
            name: pos.name,
            description: pos.description,
            department_id: pos.department_id ? String(pos.department_id) : '',
            is_active: pos.is_active,
        });
        open();
    };

    const handleDelete = async (id: number) => {
        const confirmed = await confirm({
            title: 'ลบตำแหน่ง',
            message: 'คุณแน่ใจหรือไม่ที่จะลบตำแหน่งนี้?',
            variant: 'danger',
            confirmText: 'ลบ',
            cancelText: 'ยกเลิก',
        });

        if (!confirmed) return;

        try {
            await api.delete(`/hr/positions/${id}`);
            fetchData();
        } catch {
            alert('ไม่สามารถลบตำแหน่งได้');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('กรุณากรอกชื่อตำแหน่ง');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                department_id: formData.department_id ? Number(formData.department_id) : null,
                is_active: formData.is_active,
            };

            if (editingPos) {
                await api.put(`/hr/positions/${editingPos.id}`, payload);
            } else {
                await api.post('/hr/positions', payload);
            }
            close();
            fetchData();
        } catch {
            alert('เกิดข้อผิดพลาดในการบันทึก');
        } finally {
            setSaving(false);
        }
    };

    const departmentOptions = [
        { value: '', label: 'ไม่ระบุแผนก' },
        ...departments.map((d) => ({ value: String(d.id), label: d.name })),
    ];

    const columns: Column<Position>[] = [
        {
            header: 'ตำแหน่ง',
            accessorKey: 'name',
            cell: (_: string, pos: Position) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Briefcase size={18} />
                    </div>
                    <div>
                        <div className="font-medium text-white">{pos.name}</div>
                        <div className="text-sm text-gray-500">{pos.description || '-'}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'แผนก',
            accessorKey: 'department',
            cell: (dept: Department | undefined) => (
                <span className="text-gray-400">{dept?.name || '-'}</span>
            ),
        },
        {
            header: 'สถานะ',
            accessorKey: 'is_active',
            cell: (active: boolean) => (
                <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        active
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-red-400'}`}
                    />
                    {active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
            ),
        },
        {
            header: '',
            className: 'text-right',
            cell: (_: unknown, pos: Position) => (
                <Dropdown align="right">
                    <DropdownItem icon={Edit2} onClick={() => handleEdit(pos)}>
                        แก้ไข
                    </DropdownItem>
                    <DropdownItem
                        icon={Trash2}
                        variant="danger"
                        onClick={() => handleDelete(pos.id)}
                    >
                        ลบ
                    </DropdownItem>
                </Dropdown>
            ),
        },
    ];

    if (isLoading && positions.length === 0) {
        return <PageLoading text="กำลังโหลดข้อมูลตำแหน่ง..." />;
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                        จัดการตำแหน่ง
                    </h1>
                    <p className="text-sm md:text-base text-gray-400">
                        จัดการข้อมูลตำแหน่งงานในองค์กร
                    </p>
                </div>

                <Button onClick={handleCreate} icon={<Plus size={18} />}>
                    เพิ่มตำแหน่ง
                </Button>
            </div>

            <DataTable columns={columns} data={positions} isLoading={isLoading} hidePagination />

            {/* Form Modal */}
            <FormModal
                isOpen={isOpen}
                onClose={close}
                onSubmit={handleSubmit}
                title={editingPos ? 'แก้ไขตำแหน่ง' : 'เพิ่มตำแหน่ง'}
                isLoading={saving}
            >
                <div className="space-y-4">
                    <Input
                        id="name"
                        label="ชื่อตำแหน่ง *"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="เช่น Software Engineer, Designer"
                        icon={Briefcase}
                    />
                    <Select
                        id="department_id"
                        label="แผนก"
                        value={formData.department_id}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, department_id: e.target.value }))
                        }
                        options={departmentOptions}
                        icon={Building}
                    />
                    <Input
                        id="description"
                        label="คำอธิบาย"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="คำอธิบายเพิ่มเติม..."
                    />
                    <Checkbox
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                        }
                        label="เปิดใช้งาน"
                    />
                </div>
            </FormModal>

            <ConfirmDialog />
        </div>
    );
}
