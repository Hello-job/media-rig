"use client";
import { useLocale } from "@/i18n/LocaleProvider";
import { Check, MousePointer2, Pencil, Play, Scissors, Type } from "lucide-react";
import styles from "./CatalogMediaPreview.module.css";

/** Static catalog artwork, using the same source media as the interactive demos. */
export default function CatalogMediaPreview({ kind, className }: { kind: "video-trim" | "image-annotation"; className: string }) {
  const { t, locale } = useLocale();
  if (kind === "video-trim") return <div className={`${styles.video} ${className}`} role="img" aria-label={t("视频截取：真实航船镜头与白色五秒选区")}>
    <img className={styles.videoPoster} src="/assets/video-trim/poster.jpg" alt="" loading="lazy" />
    <div className={styles.videoShade} />
    <div className={styles.videoTop}><span><Scissors size={12} /> VIDEO TRIM</span><span className={styles.duration}>00:34.83</span></div>
    <div className={styles.play}><Play size={20} fill="currentColor" strokeWidth={0} /></div>
    <div className={styles.timelinePanel}>
      <div className={styles.timelineHeading}><span>{t("Selected clip")}</span><strong>5.00 <span>{t("s")}</span></strong><span className={styles.done}><Check size={12} /> {t("Ready")}</span></div>
      <div className={styles.timeline}>
        {Array.from({ length: 8 }, (_, index) => <img key={index} src={`/assets/video-trim/frame-${String(index + 1).padStart(2, "0")}.jpg`} alt="" loading="lazy" />)}
        <div className={styles.timelineDim} />
        <div className={styles.selection}><i /><i /></div>
        <div className={styles.playhead} />
      </div>
      <div className={styles.timelineTicks}><span>00:00</span><span>00:10</span><span>00:20</span><span>00:34</span></div>
    </div>
  </div>;

  return <div className={`${styles.editorial} ${className}`} role="img" aria-label={t("图片涂鸦：韩系杂志人像与手绘标注")}>
    <img className={styles.portrait} src="/assets/image-annotation/editorial-portrait.png" alt="" loading="lazy" />
    <div className={styles.editorialCopy}><span>{t("PORTRAIT STUDY / 01")}</span><strong>{t("The")}<br />{t("quiet muse.")}</strong><small>{t("Natural light. A closer look.")}</small></div>
    <div className={styles.annotationTools}><Pencil size={13} /><MousePointer2 size={13} /><Type size={13} /><span /></div>
    <svg className={styles.markup} viewBox="0 0 800 400" preserveAspectRatio="none" aria-hidden="true">
      <path d="M 75 247 Q 146 259 246 247 M 248 291 Q 315 305 349 268 M 335 276 L 349 268 L 347 284" />
      <path d="M 418 75 Q 454 41 508 59 M 608 182 Q 606 220 577 235" />
    </svg>
    <span className={styles.annotationNote}>{t("保留自然光")}</span>
    <span className={styles.editorialFooter}>IMAGE ANNOTATION <span>{t("Draw your point of view ↗")}</span></span>
  </div>;
}
