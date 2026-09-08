import type { Metadata } from "next";
import { DirectorWorkspace } from "../../../preview/components/ComponentLibraryApp";
export const metadata: Metadata = { title: "3D 导演台工作区", robots: { index: false, follow: true }, alternates: { canonical: "/components/director-stage" } };
export default function DirectorPage() { return <DirectorWorkspace />; }
