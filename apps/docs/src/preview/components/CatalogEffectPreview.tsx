"use client";
import { useLocale } from "@/i18n/LocaleProvider";
import React from "react";

/** Lightweight layer preview; the editor uses these same extracted assets. */
export default function CatalogEffectPreview({ className }: { kind: "layer-separator"; className: string }) {
  const { t } = useLocale();
  return <div className={`relative ${className}`} role="img" aria-label={t("图层分离：泳池度假人像、护肤品与泳池背景独立图层")}>
    <svg viewBox="0 0 800 400" className="h-full w-full" aria-hidden="true">
      <defs>
        <clipPath id="pool-scene-clip"><rect x="30" y="28" width="504" height="332" rx="14" /></clipPath>
        <pattern id="pool-checker" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#242728" /><path d="M0 0h8v8H0zM8 8h8v8H8z" fill="#2b2e2f" /></pattern>
        <linearGradient id="pool-shade" x1="0" y1="0" x2="0" y2="1"><stop offset=".5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".65" /></linearGradient>
      </defs>
      <image href="/assets/layer-separator/poolside/scene.svg" x="30" y="28" width="504" height="332" preserveAspectRatio="xMidYMid slice" clipPath="url(#pool-scene-clip)" />
      <rect x="30" y="28" width="504" height="332" rx="14" fill="url(#pool-shade)" />
      <text x="51" y="58" fill="white" fontSize="11" letterSpacing="2" fontFamily="sans-serif">{t("泳池畔 / 杂志大片")}</text>
      <text x="51" y="333" fill="white" fontSize="13" fontFamily="sans-serif">{t("一张照片，重新编排每个细节。")}</text>
      <g transform="rotate(-4 579 187)">
        <rect x="492" y="45" width="174" height="290" rx="12" fill="url(#pool-checker)" stroke="#ffffff65" />
        <svg x="506" y="62" width="146" height="231" viewBox="401 8 355 966" preserveAspectRatio="xMidYMid meet">
          <image href="/assets/layer-separator/poolside/model.png" width="1536" height="1024" />
        </svg>
        <rect x="492" y="300" width="174" height="35" rx="12" fill="#202324" />
        <text x="508" y="322" fill="#e9eded" fontSize="12" fontFamily="sans-serif">{t("01  度假人像")}</text>
        <circle cx="647" cy="318" r="3" fill="#fafafa" />
      </g>
      <g transform="rotate(5 700 264)">
        <rect x="632" y="159" width="142" height="190" rx="12" fill="url(#pool-checker)" stroke="#ffffff65" />
        <svg x="641" y="169" width="124" height="134" viewBox="1080 502 471 533" preserveAspectRatio="xMidYMid meet">
          <image href="/assets/layer-separator/poolside/skincare.png" width="1536" height="1024" />
        </svg>
        <rect x="632" y="314" width="142" height="35" rx="12" fill="#202324" />
        <text x="645" y="336" fill="#e9eded" fontSize="12" fontFamily="sans-serif">{t("02  夏日护肤")}</text>
      </g>
      <text x="511" y="381" fill="#969e9e" fontSize="10" letterSpacing="1.5" fontFamily="sans-serif">{t("分离 · 移动 · 编排")}</text>
    </svg>
  </div>;
}
