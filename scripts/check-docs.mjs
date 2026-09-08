import assert from "node:assert/strict";
const base = process.env.DOCS_URL || "http://localhost:3000";
const slugs = ["image-annotation", "layer-separator", "image-editor", "image-angle-rig", "light-sphere", "director-stage"];
for (const slug of slugs) {
  const response = await fetch(`${base}/components/${slug}`);
  assert.equal(response.status, 200, slug);
  const html = await response.text();
  const content = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  assert.match(content, /<h1\b/);
  assert.match(content, /核心 API/);
  assert.match(content, /pnpm dlx media-rig@latest add/);
  assert.ok(content.includes(`href="https://media-rig.vercel.app/components/${slug}"`), `canonical: ${slug}`);
  assert.ok(html.includes('application/ld+json'), `structured data: ${slug}`);
}
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
for (const slug of slugs) assert.ok(sitemap.includes(`/components/${slug}`));
assert.match(await (await fetch(`${base}/robots.txt`)).text(), /Sitemap:/);
assert.equal((await fetch(`${base}/components/not-a-component`)).status, 404);
for (const [query, target] of [["component=image-annotation", "/components/image-annotation"], ["demo=layers", "/components/layer-separator"], ["component=director-stage", "/playground/director-stage"], ["component=director-stage&docs=1", "/components/director-stage"]]) {
  const response = await fetch(`${base}/?${query}`, { redirect: "manual" });
  assert.equal(response.status, 308);
  assert.equal(new URL(response.headers.get("location"), base).pathname, target);
}
assert.equal((await fetch(`${base}/opengraph-image`)).headers.get("content-type"), "image/png");
console.log("Verified 6 prerendered component pages, canonical URLs, structured data, sitemap, robots, 404, legacy redirects and OG image.");
