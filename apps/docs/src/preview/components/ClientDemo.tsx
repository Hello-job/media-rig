"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { Loader } from "@/components/motion/loader";
import dynamic from "next/dynamic";
import type { MediaComponentMeta } from "../catalog";

function DemoLoading() { const { t } = useLocale(); return <div className="grid min-h-96 place-items-center text-sm text-white/45"><div className="flex items-center gap-3"><Loader size={20} label={t("正在加载交互演示")} />{t("正在加载交互演示…")}</div></div>; }
const demos = {
  "video-editor": dynamic(() => import("../pages/VideoEditorPreview"), { ssr: false, loading: DemoLoading }),
  "video-trim": dynamic(() => import("../pages/VideoTrimPreview"), { ssr: false, loading: DemoLoading }),
  "light-sphere": dynamic(() => import("../pages/LightSpherePreview"), { ssr: false, loading: DemoLoading }),
  "image-angle-rig": dynamic(() => import("../pages/ImageAngleRigPreview"), { ssr: false, loading: DemoLoading }),
  "director-stage": dynamic(() => import("../pages/DirectorStagePreview"), { ssr: false, loading: DemoLoading }),
  "image-editor": dynamic(() => import("../pages/ImageEditorPreview"), { ssr: false, loading: DemoLoading }),
  "image-annotation": dynamic(() => import("../pages/ImageAnnotationPreview"), { ssr: false, loading: DemoLoading }),
  "layer-separator": dynamic(() => import("../pages/LayerSeparatorPreview"), { ssr: false, loading: DemoLoading }),
};

export default function ClientDemo({ slug }: { slug: MediaComponentMeta["slug"] }) {
  const Demo = demos[slug];
  return <Demo />;
}
