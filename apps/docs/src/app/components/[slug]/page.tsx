import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findComponent, mediaComponents } from "../../../preview/catalog";
import { ComponentDetail } from "../../../preview/components/ComponentLibraryApp";
import { getPreviewSource } from "../../../lib/preview-source";
import { SITE_URL } from "../../../lib/site";

export const dynamicParams = false;
export function generateStaticParams() { return mediaComponents.map(({ slug }) => ({ slug })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const component = findComponent((await params).slug);
  if (!component) notFound();
  return {
    title: `${component.title} React 组件`, description: component.description,
    alternates: { canonical: `/components/${component.slug}` },
    openGraph: { title: `${component.title} | MediaRig`, description: component.description, url: `/components/${component.slug}`, images: ["/opengraph-image"] },
    twitter: { card: "summary_large_image", title: `${component.title} | MediaRig`, description: component.description, images: ["/opengraph-image"] },
  };
}
export default async function ComponentPage({ params }: Props) {
  const component = findComponent((await params).slug);
  if (!component) notFound();
  const source = await getPreviewSource(component.slug);
  const schema = { "@context": "https://schema.org", "@type": "TechArticle", headline: component.title, description: component.description, url: `${SITE_URL}/components/${component.slug}`, inLanguage: "zh-CN", author: { "@type": "Organization", name: "MediaRig", url: SITE_URL } };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} /><ComponentDetail component={component} source={source} /></>;
}
