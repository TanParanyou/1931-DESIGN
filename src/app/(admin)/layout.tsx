import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-900 text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-black border-r border-white/10 p-6 flex flex-col">
                <div className="text-2xl font-bold tracking-widest mb-10 text-white">
                    1931 ADMIN
                </div>
                <nav className="space-y-4 flex-1">
                    <Link
                        href="/admin"
                        className="block px-4 py-2 rounded hover:bg-white/10 transition-colors"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/news"
                        className="block px-4 py-2 rounded hover:bg-white/10 transition-colors"
                    >
                        News
                    </Link>
                    <Link
                        href="/admin/careers"
                        className="block px-4 py-2 rounded hover:bg-white/10 transition-colors"
                    >
                        Careers
                    </Link>
                    <Link
                        href="/admin/projects"
                        className="block px-4 py-2 rounded hover:bg-white/10 transition-colors"
                    >
                        Projects
                    </Link>
                </nav>
                <div className="pt-6 border-t border-white/10">
                    <Link
                        href="/"
                        className="block px-4 py-2 rounded text-white/50 hover:text-white transition-colors"
                    >
                        Back to Website
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
    );
}
