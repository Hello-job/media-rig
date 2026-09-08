import type { Metadata } from "next";
import { CatalogHome } from "../preview/components/ComponentLibraryApp";
export const metadata: Metadata = { alternates: { canonical: "/" } };
export default function HomePage() { return <CatalogHome />; }
