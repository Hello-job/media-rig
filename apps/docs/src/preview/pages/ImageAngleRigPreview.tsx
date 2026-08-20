import React, { useState } from "react";
import {
  ImageAngleRig,
  type ImageAngleActionButtonProps,
  type ImageAngleState,
} from "media-rig";

function PreviewActionButton({
  className,
  input,
  onClick,
}: ImageAngleActionButtonProps) {
  const label = typeof input === "object" && input && "label" in input
    ? String(input.label)
    : "应用参数";

  return (
    <button type="button" className={className} onClick={onClick}>
      {label}
    </button>
  );
}

export default function ImageAngleRigPreview() {
  const [actionLabel, setActionLabel] = useState("应用参数");
  const [value, setValue] = useState<ImageAngleState>({
    yaw: 34,
    pitch: -25,
    zoom: 0,
    wideAngle: false,
  });

  return (
    <ImageAngleRig
      imageUrl="/assets/photo-texture2.png"
      value={value}
      onChange={setValue}
      actionButton={PreviewActionButton}
      actionInput={{ label: actionLabel, source: "preview" }}
      onAction={({ value: actionValue }) => {
        const roundedYaw = Math.round(actionValue.yaw * 10) / 10;
        setActionLabel(`已应用 Y ${roundedYaw}°`);
      }}
      style={{ height: "100%" }}
    />
  );
}
