import React from "react";
import { LayerSeparator, type LayerSeparatorResult } from "media-rig";

const RESULT: LayerSeparatorResult = {
  background: {
    id: "background",
    name: "暖光室内背景",
    url: "/assets/layer-separator/background.png",
  },
  layers: [
    {
      id: "vase",
      name: "陶瓷花瓶与枝叶",
      url: "/assets/layer-separator/vase.png",
      contentBounds: { x: 0.0716, y: 0.2549, width: 0.2396, height: 0.6006 },
    },
    {
      id: "chair",
      name: "棕色皮革休闲椅",
      url: "/assets/layer-separator/chair.png",
      contentBounds: { x: 0.3698, y: 0.4375, width: 0.3092, height: 0.458 },
    },
    {
      id: "lamp",
      name: "球形落地灯",
      url: "/assets/layer-separator/lamp.png",
      contentBounds: { x: 0.7767, y: 0.127, width: 0.0918, height: 0.7539 },
    },
  ],
};

export default function LayerSeparatorPreview() {
  return (
    <LayerSeparator
      imageUrl="/assets/layer-separator/scene.png"
      imageAlt="摄影风格的暖光室内场景，包含陶瓷花瓶、皮革休闲椅和球形落地灯"
      labels={{ description: "摄影风格示例 · 使用预置图层体验拆分与合成" }}
      aspectRatio={3 / 2}
      defaultSelections={[
        { id: "chair-selection", x1: 0.36, y1: 0.43, x2: 0.69, y2: 0.91 },
      ]}
      onSeparate={async () => {
        await new Promise((resolve) => window.setTimeout(resolve, 900));
        return RESULT;
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
