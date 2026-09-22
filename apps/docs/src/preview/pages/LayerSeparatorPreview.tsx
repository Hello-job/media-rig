"use client";
import { useLocale } from "@/i18n/LocaleProvider";
import React from "react";
import { LayerSeparator, type LayerSeparatorResult } from "media-rig";

const RESULT: LayerSeparatorResult = {
  background: {
    id: "background",
    name: "泳池与海景背景",
    url: "/assets/layer-separator/poolside/background.png",
  },
  layers: [
    {
      id: "model",
      name: "韩系度假人像",
      url: "/assets/layer-separator/poolside/model.png",
      contentBounds: { x: 0.274, y: 0.027, width: 0.205, height: 0.905 },
    },
    {
      id: "skincare",
      name: "防晒护肤与石台",
      url: "/assets/layer-separator/poolside/skincare.png",
      contentBounds: { x: 0.713, y: 0.505, width: 0.287, height: 0.491 },
    },
  ],
};

export default function LayerSeparatorPreview() {
  const { t, locale } = useLocale();
  return (
    <LayerSeparator
      locale={locale}
      imageUrl="/assets/layer-separator/poolside/scene.svg"
      imageAlt={t("泳池度假杂志风格，成年韩系模特、夏日护肤品与海景背景")}
      labels={{ description: t("泳池度假大片 · 使用预置图层体验人像与护肤品拆分") }}
      aspectRatio={3 / 2}
      defaultSelections={[
        { id: "model-selection", x1: 0.274, y1: 0.027, x2: 0.479, y2: 0.932 },
      ]}
      onSeparate={async () => {
        await new Promise((resolve) => window.setTimeout(resolve, 900));
        return { ...RESULT, background: { ...RESULT.background!, name: t(RESULT.background!.name!) }, layers: RESULT.layers.map(layer => ({ ...layer, name: t(layer.name!) })) };
      }}
      onMerge={(blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "layer-composition.png";
        anchor.click();
        URL.revokeObjectURL(url);
      }}
    />
  );
}
