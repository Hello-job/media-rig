import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { localUsageSource } from "./install";

describe("standalone usage examples", () => {
  it("removes site locale dependencies while preserving component locale options", () => {
    for (const [name, slug] of [["VideoTrim", "video-trim"], ["LayerSeparator", "layer-separator"], ["ImageAnnotation", "image-annotation"], ["ImageAngleRig", "image-angle-rig"], ["LightSphere", "light-sphere"]]) {
      const source = readFileSync(`${process.cwd()}/src/preview/pages/${name}Preview.tsx`, "utf8");
      const example = localUsageSource(source, slug);
      expect(example).not.toContain("useLocale");
      expect(example).not.toContain("@/i18n");
      expect(example).not.toMatch(/\bt\(/);
      expect(example).not.toContain("locale={locale}");
      expect(example.match(/"use client"/g)).toHaveLength(1);
      expect(example).toContain(`@/components/${slug}`);
    }
  });
});
