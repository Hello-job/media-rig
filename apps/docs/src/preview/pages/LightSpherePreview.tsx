import React, { useState } from "react";
import { ArrowUp, Check } from "lucide-react";
import { LightSpherePanel, type LightSphereActionButtonProps } from "media-rig";

function PreviewActionButton({ className, onClick, disabled, loading, input }: LightSphereActionButtonProps) {
  const applied = input === true;
  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled} aria-busy={loading} aria-label={applied ? "已应用打光" : "应用打光"} title={applied ? "已应用打光" : "应用打光"}>
      {applied ? <Check size={16} aria-hidden="true" /> : <ArrowUp size={16} aria-hidden="true" />}
    </button>
  );
}

export default function LightSpherePreview() {
  const [open, setOpen] = useState(true);
  const [applied, setApplied] = useState(false);

  return (
    <div className="grid size-full place-items-center">
      {open ? (
        <LightSpherePanel
          imageUrl="/assets/photo-texture2.png"
          onClose={() => setOpen(false)}
          onChange={() => setApplied(false)}
          actionInput={applied}
          actionButton={PreviewActionButton}
          onAction={() => setApplied(true)}
        />
      ) : (
        <button type="button" className="rounded-lg border border-white/10 bg-[#191919] px-4 py-2 text-xs text-white/80 transition-colors hover:bg-white/10" onClick={() => setOpen(true)}>
          打开打光设置
        </button>
      )}
    </div>
  );
}
