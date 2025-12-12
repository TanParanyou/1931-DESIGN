'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit2, Trash2, Plus, FolderKanban, Search, Download, Eye } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown';
import { useDataTable } from '@/hooks/useDataTable';
import { useCsvExport } from '@/hooks/useCsvExport';
import { useAuth } from '@/context/AuthContext';
import { projectService } from '@/services/project.service';
import { Project, Category } from '@/types/project';

export default function ProjectsPage() {
    const [error, setError] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const { user } = useAuth();
    const canManage = user?.permissions?.includes('projects.manage');

    // Fetch categories on load
    useState(() => {
        projectService.getCategories().then(setCategories).catch(console.error);
    });

    const fetchProjectsData = useCallback(async (params: any) => {
        try {
            const response = await projectService.getProjects(params.page, params.limit);
            return response;
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'An error occurred');
            throw err;
        }
    }, []);

    const {
        data: paginatedData,
        pagination,
        sort,
        onPageChange,
        onSort,
        onSearch,
        isLoading: loading,
        fetchData,
    } = useDataTable<Project>({
        fetcher: fetchProjectsData,
        initialPagination: { limit: 10 },
    });

    const refreshData = () => fetchData();

    const { downloadCsv } = useCsvExport();

    const handleDelete = async (id: number) => {
        if (!window.confirm('คุณต้องการลบโปรเจกต์นี้หรือไม่?')) return;

        try {
            const response = await projectService.deleteProject(id);
            if (response.success) {
                refreshData();
            } else {
                alert(response.message || 'Failed to delete project');
            }
        } catch (err: any) {
            alert(err.response?.data?.message || 'An error occurred');
        }
    };

    const handleExport = () => {
        downloadCsv({
            filename: 'projects_export.csv',
            headers: ['ID', 'Title', 'Location', 'Category', 'Status', 'Owner'],
            data: paginatedData.map((project) => [
                project.id,
                project.title,
                project.location,
                project.category,
                project.status,
                project.owner,
            ]),
        });
    };

    const columns: Column<Project>[] = [
        {
            header: 'Project',
            accessorKey: 'title',
            sortable: true,
            cell: (_: any, project: Project) => (
                <div className="flex items-center gap-3">
                    <div className="w-16 h-12 relative rounded-lg overflow-hidden bg-white/5">
                        {project.images?.[0] ? (
                            <Image
                                src={project.images[0]}
                                alt={project.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <FolderKanban size={20} />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-white">{project.title}</div>
                        <div className="text-sm text-gray-500">{project.location}</div>
                    </div>
                </div>
            ),
        },
        {
            header: 'Category',
            accessorKey: 'category',
            sortable: true,
            cell: (category: string) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {category}
                </span>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (status: string) => {
                const isCompleted = status?.toLowerCase() === 'completed';
                return (
                    <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isCompleted
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-amber-400'}`}
                        />
                        {status || 'In Progress'}
                    </span>
                );
            },
        },
        {
            header: 'Active',
            accessorKey: 'is_active',
            cell: (isActive: boolean) => (
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}
                >
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
    ];

    if (canManage) {
        columns.push({
            header: 'Actions',
            className: 'text-right',
            cell: (_: any, project: Project) => (
                <Dropdown align="right">
                    <Link href={`/projects/${project.id}`} target="_blank">
                        <DropdownItem icon={Eye}>View</DropdownItem>
                    </Link>
                    <Link href={`/admin/projects/${project.id}`}>
                        <DropdownItem icon={Edit2}>Edit</DropdownItem>
                    </Link>
                    <DropdownItem
                        icon={Trash2}
                        variant="danger"
                        onClick={() => handleDelete(project.id)}
                    >
                        Delete
                    </DropdownItem>
                </Dropdown>
            ),
        });
    }

    if (loading && !paginatedData.length)
        return <div className="p-8 text-white">Loading projects...</div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">
                        Project Management
                    </h1>
                    <p className="text-sm md:text-base text-gray-400">
                        Manage your portfolio projects
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    <div className="relative grow sm:grow-0">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            onChange={(e) => onSearch(e.target.value)}
                            className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        {canManage && (
                            <Link
                                href="/admin/projects/create"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-sm font-medium"
                            >
                                <Plus size={18} />
                                <span className="whitespace-nowrap">Create Project</span>
                            </Link>
                        )}
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-sm font-medium"
                            title="Export to CSV"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                    {error}
                </div>
            )}

            <DataTable
                columns={columns}
                data={paginatedData}
                pagination={pagination}
                sorting={sort}
                onPageChange={onPageChange}
                onSort={onSort}
            />
        </div>
    );
}
