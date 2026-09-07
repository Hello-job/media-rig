import React from "react";
import { LayerSeparator, type LayerSeparatorResult } from "media-rig";

const RESULT: LayerSeparatorResult = {
  background: {
    id: "background",
    name: "Architectural background",
    url: "/assets/layer-separator/background.svg",
  },
  layers: [
    {
      id: "vase",
      name: "Ceramic vase",
      url: "/assets/layer-separator/vase.svg",
      contentBounds: { x: 0.06, y: 0.2, width: 0.29, height: 0.71 },
    },
    {
      id: "chair",
      name: "Ochre chair",
      url: "/assets/layer-separator/chair.svg",
      contentBounds: { x: 0.44, y: 0.32, width: 0.4, height: 0.6 },
    },
    {
      id: "lamp",
      name: "Orb floor lamp",
      url: "/assets/layer-separator/lamp.svg",
      contentBounds: { x: 0.74, y: 0.12, width: 0.23, height: 0.75 },
    },
  ],
};

export default function LayerSeparatorPreview() {
  return (
    <LayerSeparator
      imageUrl="/assets/layer-separator/scene.svg"
      imageAlt="包含花瓶、椅子和落地灯的室内场景"
      aspectRatio={3 / 2}
      defaultSelections={[
        { id: "chair-selection", x1: 0.43, y1: 0.3, x2: 0.85, y2: 0.93 },
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
