import React from "react";
import { getImageAngleCubeScale } from "../ImageAngleRig.constants";
import type { ImageAngleState } from "../ImageAngleRig.types";

const FACES = [
  { label: "BK", transform: "rotateY(180deg) translateZ(36px)" },
  { label: "L", transform: "rotateY(-90deg) translateZ(36px)" },
  { label: "R", transform: "rotateY(90deg) translateZ(36px)" },
  { label: "T", transform: "rotateX(90deg) translateZ(36px)" },
  { label: "B", transform: "rotateX(-90deg) translateZ(36px)" },
];

export default function ImageAngleScene({ imageUrl, value }: {
  imageUrl: string;
  value: ImageAngleState;
}) {
  const scale = getImageAngleCubeScale(value.zoom);

  return (
    <div
      data-slot="angle-cube"
      className="pointer-events-none relative size-[72px] shrink-0 transition-transform duration-[180ms] ease-[cubic-bezier(0.2,1,0.3,1)] motion-reduce:transition-none"
      style={{
        transformStyle: "preserve-3d",
        transform: `rotateX(${value.pitch}deg) rotateY(${-value.yaw}deg) scale3d(${scale}, ${scale}, ${scale})`,
      }}
      aria-hidden="true"
    >
      <div
        data-slot="angle-cube-front"
        className="absolute flex size-full items-center justify-center overflow-hidden rounded-sm border border-white/20 bg-[#292b30]"
        style={{ transform: "rotateY(0deg) translateZ(36px)", backfaceVisibility: "hidden" }}
      >
        <img src={imageUrl} alt="" draggable={false} className="size-full select-none object-cover" />
      </div>
      {FACES.map(({ label, transform }) => (
        <div
          key={label}
          data-face={label}
          className="absolute flex size-full select-none items-center justify-center rounded-sm border border-white/10 bg-[#222]"
          style={{ transform, backfaceVisibility: "hidden" }}
        >
          <span className="text-[10px] font-bold text-white/30">{label}</span>
        </div>
      ))}
    </div>
  );
}
