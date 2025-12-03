import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Our Projects",
    description: "Explore our portfolio of residential, commercial, and hospitality projects across Thailand.",
};

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
