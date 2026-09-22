"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import { useEffect, useRef, useState } from "react";
import ClientDemo from "./ClientDemo";
import styles from "./CatalogStudioPreview.module.css";

/** Show the actual component, scaled to the catalog card without intercepting its link. */
export default function CatalogStudioPreview({ kind, className }: {
  kind: "image-angle-rig" | "light-sphere";
  className: string;
}) {
  const { t } = useLocale();
  const container = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const resize = new ResizeObserver(([entry]) => {
      setScale(Math.max(0, Math.min((entry.contentRect.width - 24) / 560, (entry.contentRect.height - 24) / 320)));
    });
    const intersection = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { rootMargin: "150px" });
    resize.observe(element);
    intersection.observe(element);
    return () => { resize.disconnect(); intersection.disconnect(); };
  }, []);

  return (
    <div ref={container} className={`relative w-full ${className}`} role="img" aria-label={`${kind === "light-sphere" ? "Light Sphere" : "Image Angle Rig"} ${t("预览")}`}>
      <div inert aria-hidden="true" className={`${styles.preview} pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[560px] origin-center`} style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        {visible && <ClientDemo slug={kind} />}
      </div>
    </div>
  );
}
