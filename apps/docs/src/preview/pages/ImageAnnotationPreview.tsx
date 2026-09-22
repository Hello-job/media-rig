"use client";
import { useLocale } from "@/i18n/LocaleProvider";
import { useState } from "react";
import { ImageAnnotation } from "media-rig";

export default function ImageAnnotationPreview() {
  const { t, locale } = useLocale();
  const [message, setMessage] = useState("");
  return <div className="w-full">
    <ImageAnnotation imageUrl="/assets/image-annotation/editorial-portrait.png" imageAlt={t("韩系个人杂志风肖像")} onSave={(blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "annotated-image.png";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("已导出原图尺寸的 PNG 图片");
    }} />
    {message && <p role="status" className="mt-3 text-center text-xs text-white/50">{t(message)}</p>}
  </div>;
}
