"use client";

import dynamic from "next/dynamic";
import type { MediaComponentMeta } from "../catalog";

const loading = () => <div className="grid min-h-96 place-items-center text-sm text-white/45">正在加载交互演示…</div>;
const demos = {
  "light-sphere": dynamic(() => import("../pages/LightSpherePreview"), { ssr: false, loading }),
  "image-angle-rig": dynamic(() => import("../pages/ImageAngleRigPreview"), { ssr: false, loading }),
  "director-stage": dynamic(() => import("../pages/DirectorStagePreview"), { ssr: false, loading }),
  "image-editor": dynamic(() => import("../pages/ImageEditorPreview"), { ssr: false, loading }),
  "image-annotation": dynamic(() => import("../pages/ImageAnnotationPreview"), { ssr: false, loading }),
  "layer-separator": dynamic(() => import("../pages/LayerSeparatorPreview"), { ssr: false, loading }),
};

export default function ClientDemo({ slug }: { slug: MediaComponentMeta["slug"] }) {
  const Demo = demos[slug];
  return <Demo />;
}
