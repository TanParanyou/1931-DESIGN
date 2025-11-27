import { HeroSlider } from "@/components/home/HeroSlider";
import Image from "next/image";

export default function Home() {
  const projects = [
    { id: 1, title: "SKYLINE TOWER", location: "BANGKOK", image: "/images/slide1.png" },
    { id: 2, title: "THE PAVILION", location: "PHUKET", image: "/images/slide2.png" },
    { id: 3, title: "URBAN OASIS", location: "CHIANG MAI", image: "/images/slide3.png" },
    { id: 4, title: "RIVERSIDE RESIDENCE", location: "BANGKOK", image: "/images/slide2.png" },
  ];

  return (
    <div className="flex flex-col">
      <HeroSlider />

      <section className="py-24 px-6 max-w-[1920px] mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-light tracking-wide">SELECTED PROJECTS</h2>
          <a href="#" className="text-sm tracking-widest border-b border-black pb-1 hover:opacity-50 transition-opacity">VIEW ALL</a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div key={project.id} className="group cursor-pointer">
              <div className="relative aspect-[4/3] overflow-hidden mb-4">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="text-xl font-medium tracking-wide">{project.title}</h3>
              <p className="text-sm text-gray-500 tracking-widest mt-1">{project.location}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
