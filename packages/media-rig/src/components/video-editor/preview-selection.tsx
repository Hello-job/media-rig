import { useMemo, useRef } from "react";
import { useFrameCallback } from "./use-frame-callback";
import { Button } from "./internal/components/ui/button";
import { useI18n } from "./video-editor-context";
import { editTextBounds } from "./draw-text";
import { videoBounds } from "./preview-geometry";
import type { EditClip } from "./types";

export function PreviewSelection({
  clip,
  width,
  height,
  disabled,
  onDraft,
  onCommit,
  onStop,
}: {
  clip: EditClip;
  width: number;
  height: number;
  disabled: boolean;
  onDraft: (clip: EditClip | null) => void;
  onCommit: (clip: EditClip) => void;
  onStop: () => void;
}) {
  const { t } = useI18n();
  const drag = useRef<{
    x: number;
    y: number;
    clip: EditClip;
    mode: "move" | "scale";
  } | null>(null);
  const bounds = useMemo(() => {
    if (clip.kind === "audio") return { x: 0, y: 0, width: 0, height: 0 };
    return clip.kind === "text"
      ? editTextBounds(clip, width, height)
      : videoBounds(clip, width, height);
  }, [clip, width, height]);
  const changed = (x: number, y: number) => {
    const active = drag.current;
    if (!active) return clip;
    const dx = (x - active.x) / width;
    const dy = (y - active.y) / height;
    const original = active.clip;
    if (original.kind === "audio") return original;
    if (active.mode === "move") {
      if (original.kind === "text")
        return {
          ...original,
          x: Math.max(0, Math.min(1, original.x + dx)),
          y: Math.max(0, Math.min(1, original.y + dy)),
        };
      const transform = original.transform ?? { x: 0.5, y: 0.5, scale: 1 };
      return {
        ...original,
        transform: {
          ...transform,
          x: Math.max(0, Math.min(1, transform.x + dx)),
          y: Math.max(0, Math.min(1, transform.y + dy)),
        },
      };
    }
    const factor = Math.max(0.1, 1 + dx + dy);
    if (original.kind === "text")
      return {
        ...original,
        fontSize: Math.max(12, Math.min(200, original.fontSize * factor)),
      };
    const transform = original.transform ?? { x: 0.5, y: 0.5, scale: 1 };
    return {
      ...original,
      transform: {
        ...transform,
        scale: Math.max(0.1, Math.min(3, transform.scale * factor)),
      },
    };
  };
  const draft = useFrameCallback((x: number, y: number) => {
    if (drag.current) onDraft(changed(x, y));
  });
  if (clip.kind === "audio") return null;
  const events = (mode: "move" | "scale") => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled || e.button !== 0) return;
      draft.cancel();
      e.preventDefault();
      e.currentTarget.focus({ preventScroll: true });
      e.stopPropagation();
      onStop();
      drag.current = { x: e.clientX, y: e.clientY, clip, mode };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (drag.current && e.currentTarget.hasPointerCapture(e.pointerId))
        draft.schedule(e.clientX, e.clientY);
    },
    onLostPointerCapture: () => {
      draft.cancel();
      drag.current = null;
      onDraft(null);
    },
    onPointerCancel: () => {
      draft.cancel();
      drag.current = null;
      onDraft(null);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!drag.current || !e.currentTarget.hasPointerCapture(e.pointerId))
        return;
      draft.cancel();
      const next = changed(e.clientX, e.clientY);
      drag.current = null;
      e.currentTarget.releasePointerCapture(e.pointerId);
      onDraft(null);
      onCommit(next);
    },
  });
  return (
    <div
      className="pointer-events-none absolute border border-[var(--ui-accent)]"
      style={{
        left: bounds.x,
        top: bounds.y,
        width: bounds.width,
        height: bounds.height,
      }}
    >
      <Button
        variant="ghost"
        aria-label={t("videoEditor.moveSelection")}
        disabled={disabled}
        className="pointer-events-auto absolute inset-0 h-full w-full cursor-move touch-none rounded-none p-0 hover:bg-transparent active:bg-transparent transition-none"
        {...events("move")}
        onKeyDown={(e) => {
          if (
            !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
          )
            return;
          e.preventDefault();
          const dx =
            Number(e.key === "ArrowRight") - Number(e.key === "ArrowLeft");
          const dy =
            Number(e.key === "ArrowDown") - Number(e.key === "ArrowUp");
          if (clip.kind === "text")
            onCommit({
              ...clip,
              x: Math.max(0, Math.min(1, clip.x + dx * 0.01)),
              y: Math.max(0, Math.min(1, clip.y + dy * 0.01)),
            });
          else {
            const transform = clip.transform ?? { x: 0.5, y: 0.5, scale: 1 };
            onCommit({
              ...clip,
              transform: {
                ...transform,
                x: Math.max(0, Math.min(1, transform.x + dx * 0.01)),
                y: Math.max(0, Math.min(1, transform.y + dy * 0.01)),
              },
            });
          }
        }}
      />
      <Button
        variant="ghost"
        aria-label={t("videoEditor.resizeSelection")}
        disabled={disabled}
        className="pointer-events-auto absolute -right-3 -bottom-3 size-6 cursor-nwse-resize touch-none p-0 hover:bg-transparent active:bg-transparent transition-none"
        {...events("scale")}
        onKeyDown={(e) => {
          if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
          e.preventDefault();
          const step = e.key === "ArrowUp" ? 1 : -1;
          if (clip.kind === "text")
            onCommit({
              ...clip,
              fontSize: Math.max(12, Math.min(200, clip.fontSize + step)),
            });
          else {
            const transform = clip.transform ?? { x: 0.5, y: 0.5, scale: 1 };
            onCommit({
              ...clip,
              transform: {
                ...transform,
                scale: Math.max(
                  0.1,
                  Math.min(3, transform.scale + step * 0.05),
                ),
              },
            });
          }
        }}
      >
        <span className="size-2 rounded-[var(--ui-radius-xs)] border border-[var(--ui-text-primary)] bg-[var(--ui-accent)]" />
      </Button>
      <span className="absolute -left-1 -bottom-1 size-2 rounded-[var(--ui-radius-xs)] border border-[var(--ui-text-primary)] bg-[var(--ui-accent)]" />
    </div>
  );
}
