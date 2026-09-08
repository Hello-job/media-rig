import { readFile } from "node:fs/promises";
import path from "node:path";
import type { MediaComponentMeta } from "../preview/catalog";

const files: Record<MediaComponentMeta["slug"], string> = {
  "light-sphere": "LightSpherePreview.tsx",
  "image-angle-rig": "ImageAngleRigPreview.tsx",
  "director-stage": "DirectorStagePreview.tsx",
  "image-editor": "ImageEditorPreview.tsx",
  "image-annotation": "ImageAnnotationPreview.tsx",
  "layer-separator": "LayerSeparatorPreview.tsx",
};
export function getPreviewSource(slug: MediaComponentMeta["slug"]) {
  return readFile(path.join(process.cwd(), "src/preview/pages", files[slug]), "utf8");
}
