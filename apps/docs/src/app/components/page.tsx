import type { Metadata } from "next";
import { CatalogHome } from "../../preview/components/ComponentLibraryApp";

export const metadata: Metadata = {
  title: "组件列表",
  alternates: { canonical: "/components" },
};

export default function ComponentsPage() { return <CatalogHome />; }
