import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const slugs = "video-editor|video-trim|light-sphere|image-angle-rig|director-stage|image-editor|image-annotation|layer-separator";
export default {
  outputFileTracingRoot: root,
  transpilePackages: ["media-rig"],
  webpack(config) {
    config.module.rules.push({ test: /\.glb$/i, resourceQuery: /url/, type: "asset/resource" });
    return config;
  },
  async redirects() {
    return [
      { source: "/", has: [{ type: "query", key: "component", value: "director-stage" }, { type: "query", key: "docs", value: "1" }], destination: "/components/director-stage", permanent: true },
      { source: "/", has: [{ type: "query", key: "component", value: "director-stage" }], destination: "/playground/director-stage", permanent: true },
      { source: "/", has: [{ type: "query", key: "component", value: `(?<slug>${slugs})` }], destination: "/components/:slug", permanent: true },
      ...Object.entries({ trim: "video-trim", light: "light-sphere", angle: "image-angle-rig", editor: "image-editor", annotation: "image-annotation", layers: "layer-separator" }).map(([demo, slug]) => ({ source: "/", has: [{ type: "query", key: "demo", value: demo }], destination: `/components/${slug}`, permanent: true })),
      { source: "/", has: [{ type: "query", key: "demo", value: "director" }], destination: "/playground/director-stage", permanent: true },
    ];
  },
};
