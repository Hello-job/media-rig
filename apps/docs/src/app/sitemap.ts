import type { MetadataRoute } from "next";
import { mediaComponents } from "../preview/catalog";
import { SITE_URL } from "../lib/site";
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, priority: 1 }, ...mediaComponents.map(({ slug }) => ({ url: `${SITE_URL}/components/${slug}`, priority: 0.8 }))];
}
