import React, { useState } from "react";
import { ArrowUp, Check } from "lucide-react";
import {
  DEFAULT_IMAGE_ANGLE_STATE,
  ImageAngleRig,
  type ImageAngleActionButtonProps,
  type ImageAngleState,
} from "media-rig";

function PreviewActionButton({
  className,
  input,
  onClick,
  disabled,
  loading,
}: ImageAngleActionButtonProps) {
  const label = typeof input === "object" && input && "label" in input
    ? String(input.label)
    : "应用参数";

  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled} aria-busy={loading} aria-label={label} title={label}>
      {label.startsWith("已应用") ? <Check size={16} aria-hidden="true" /> : <ArrowUp size={16} aria-hidden="true" />}
    </button>
  );
}

export default function ImageAngleRigPreview() {
  const [open, setOpen] = useState(true);
  const [actionLabel, setActionLabel] = useState("应用参数");
  const [value, setValue] = useState<ImageAngleState>({ ...DEFAULT_IMAGE_ANGLE_STATE });

  return (
    <div className="grid size-full place-items-center">
      {open ? (
        <ImageAngleRig
          onClose={() => setOpen(false)}
          imageUrl="/assets/photo-texture2.png"
          value={value}
          onChange={(nextValue) => {
            setValue(nextValue);
            setActionLabel("应用参数");
          }}
          actionButton={PreviewActionButton}
          actionInput={{ label: actionLabel, source: "preview" }}
          onAction={({ value: actionValue }) => {
            const roundedYaw = Math.round(actionValue.yaw * 10) / 10;
            setActionLabel(`已应用 Y ${roundedYaw}°`);
          }}
        />
      ) : (
        <button type="button" className="rounded-lg border border-white/10 bg-[#191919] px-4 py-2 text-xs text-white/80 transition-colors hover:bg-white/10" onClick={() => setOpen(true)}>
          打开视角设置
        </button>
      )}
    </div>
  );
}
