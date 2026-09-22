import type { Metadata } from "next";
import Welcome from "./Welcome";

export const metadata: Metadata = { alternates: { canonical: "/" } };
export default function HomePage() { return <Welcome />; }
