export default function AdminDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-light tracking-wide mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black/20 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-sm font-bold tracking-widest text-white/50 mb-2">
                        TOTAL NEWS
                    </h3>
                    <p className="text-4xl font-light">12</p>
                </div>
                <div className="bg-black/20 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-sm font-bold tracking-widest text-white/50 mb-2">
                        ACTIVE CAREERS
                    </h3>
                    <p className="text-4xl font-light">4</p>
                </div>
                <div className="bg-black/20 border border-white/10 p-6 rounded-xl">
                    <h3 className="text-sm font-bold tracking-widest text-white/50 mb-2">
                        PROJECTS
                    </h3>
                    <p className="text-4xl font-light">8</p>
                </div>
            </div>
        </div>
    );
}
