import { HeroSlider } from '@/components/home/HeroSlider';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { projects } from '@/lib/data';

export default function Home() {

    return (
        <div className="flex flex-col min-h-screen">
            <HeroSlider />

            <section className="relative py-32 px-6 w-full overflow-hidden">
                {/* Background Elements */}
                {/* <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px]" />
        </div> */}

                <div className="max-w-[1920px] mx-auto">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-light tracking-wide text-white mb-2">
                                SELECTED PROJECTS
                            </h2>
                            <div className="h-1 w-24 bg-linear-to-r from-emerald-500 to-emerald-500 rounded-full" />
                        </div>
                        <Link
                            href="/projects"
                            className="group flex items-center gap-2 text-sm tracking-[0.2em] text-white/70 hover:text-white transition-colors"
                        >
                            VIEW ALL
                            <ArrowRight
                                size={16}
                                className="group-hover:translate-x-1 transition-transform"
                            />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {projects.map((project) => (
                            <Link
                                href={`/projects/${project.id}`}
                                key={project.id}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-4/3 overflow-hidden rounded-2xl mb-6 border border-white/10 shadow-2xl">
                                    <Image
                                        src={project.image}
                                        alt={project.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />

                                    {/* Glass Card Overlay on Hover */}
                                    <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                                        <div className="glass p-6 rounded-xl">
                                            <span className="text-xs tracking-widest text-green-300">
                                                VIEW PROJECT
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-light tracking-wide text-white group-hover:text-green-500 transition-colors">
                                    {project.title}
                                </h3>
                                <p className="text-sm text-white/50 tracking-[0.2em] mt-2">
                                    {project.location}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
