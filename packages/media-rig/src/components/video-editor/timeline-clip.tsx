import { ClipContextMenu } from "./clip-context-menu";
import { useRef, useState } from "react";
import { useFrameCallback } from "./use-frame-callback";
import { Button } from "./internal/components/ui/button";
import { useI18n } from "./video-editor-context";
import { cn } from "./internal/lib/utils";
import { VideoClipStrip } from "./video-clip-strip";
import { AudioClipWaveform } from "./audio-clip-waveform";
import {
  clipDuration,
  moveVideo,
  normalizeEdit,
  snapTime,
  trimClip,
} from "./timeline";
import type { EditClip, VideoEditDocument, VideoEditorServices } from "./types";
import { isSubtitle } from "./subtitles";

type Gesture = {
  x: number;
  mode: "move" | "in" | "out";
  doc: VideoEditDocument;
  points: number[];
};
export function TimelineClip({
  clip,
  visibleRange,
  loadThumbnails,
  doc,
  selected,
  zoom,
  time,
  snapping,
  disabled,
  onSelect,
  onCommit,
}: {
  clip: EditClip;
  visibleRange?: { start: number; end: number };
  loadThumbnails?: VideoEditorServices["loadThumbnails"];
  doc: VideoEditDocument;
  selected: boolean;
  zoom: number;
  time: number;
  snapping: boolean;
  disabled: boolean;
  onSelect: (id: string) => void;
  onCommit: (doc: VideoEditDocument) => void;
}) {
  const { t } = useI18n();
  const gesture = useRef<Gesture | null>(null);
  const [preview, setPreview] = useState<EditClip | null>(null);
  const displayed = preview ?? clip;
  const adjusted = (mode: Gesture["mode"], delta: number) => {
    const points = gesture.current?.points ?? [0, time];
    const start = clip.start;
    const end = start + clipDuration(clip);
    if (mode === "move") {
      let next = Math.max(0, start + delta);
      if (snapping && clip.kind !== "video") {
        const snappedStart = snapTime(next, points, 8 / zoom);
        const snappedEnd =
          snapTime(next + clipDuration(clip), points, 8 / zoom) -
          clipDuration(clip);
        next = snappedStart !== next ? snappedStart : Math.max(0, snappedEnd);
      }
      return { ...clip, start: next };
    }
    let edge = (mode === "in" ? start : end) + delta;
    if (snapping) edge = snapTime(edge, points, 8 / zoom);
    return trimClip(clip, mode, edge - (mode === "in" ? start : end));
  };
  const draft = useFrameCallback((x: number) => {
    const active = gesture.current;
    if (active) setPreview(adjusted(active.mode, (x - active.x) / zoom));
  });
  const events = (mode: Gesture["mode"]) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled || e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.focus({ preventScroll: true });
      e.stopPropagation();
      draft.cancel();
      onSelect(clip.id);
      gesture.current = {
        x: e.clientX,
        mode,
        doc,
        points: [
          0,
          time,
          ...doc.clips
            .filter((item) => item.id !== clip.id)
            .flatMap((item) => [item.start, item.start + clipDuration(item)]),
        ],
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => {
      const active = gesture.current;
      if (active && e.currentTarget.hasPointerCapture(e.pointerId))
        draft.schedule(e.clientX);
    },
    onLostPointerCapture: () => {
      draft.cancel();
      gesture.current = null;
      setPreview(null);
    },
    onPointerCancel: () => {
      draft.cancel();
      gesture.current = null;
      setPreview(null);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      const active = gesture.current;
      if (!active || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
      draft.cancel();
      const next = adjusted(active.mode, (e.clientX - active.x) / zoom);
      e.currentTarget.releasePointerCapture(e.pointerId);
      gesture.current = null;
      setPreview(null);
      if (active.doc !== doc || Math.abs(e.clientX - active.x) < 2) return;
      if (clip.kind === "video" && active.mode === "move") {
        const videos = doc.clips.filter(
          (c) => c.kind === "video" && c.id !== clip.id,
        );
        const at = videos.findIndex(
          (c) => next.start < c.start + clipDuration(c) / 2,
        );
        videos.splice(at < 0 ? videos.length : at, 0, clip);
        onCommit(
          normalizeEdit({
            ...doc,
            clips: [...videos, ...doc.clips.filter((c) => c.kind !== "video")],
          }),
        );
      } else
        onCommit(
          normalizeEdit({
            ...doc,
            clips: doc.clips.map((c) => (c.id === clip.id ? next : c)),
          }),
        );
    },
  });
  const width = Math.max(6, clipDuration(displayed) * zoom);
  return (
    <ClipContextMenu
      clip={clip}
      doc={doc}
      time={time}
      disabled={disabled}
      onCommit={onCommit}
      onSelect={onSelect}
    >
      <div
        className={cn(
          "edit-clip absolute inset-y-0",
          `edit-clip-${clip.kind}`,
          isSubtitle(clip) && "edit-clip-subtitle",
          selected && "edit-clip-selected",
        )}
        style={{ left: displayed.start * zoom, width }}
      >
        <Button
          variant="ghost"
          aria-label={clip.kind === "text" ? clip.text : clip.source.label}
          aria-pressed={selected}
          disabled={disabled}
          className="relative h-full w-full touch-none overflow-hidden rounded-none p-0 hover:bg-transparent active:bg-transparent transition-none"
          {...events("move")}
          onClick={() => onSelect(clip.id)}
          onKeyDown={(e) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            const direction = e.key === "ArrowLeft" ? -1 : 1;
            if (clip.kind === "video")
              onCommit(moveVideo(doc, clip.id, direction));
            else
              onCommit({
                ...doc,
                clips: doc.clips.map((c) =>
                  c.id === clip.id
                    ? { ...c, start: Math.max(0, c.start + direction * 0.1) }
                    : c,
                ),
              });
          }}
        >
          {clip.kind === "video" && (
            <VideoClipStrip
              clip={displayed as typeof clip}
              width={width}
              loadThumbnails={loadThumbnails}
              visibleFrom={
                visibleRange ? (visibleRange.start - displayed.start) * zoom : 0
              }
              visibleTo={
                visibleRange
                  ? (visibleRange.end - displayed.start) * zoom
                  : width
              }
            />
          )}
          {clip.kind === "audio" && (
            <AudioClipWaveform clip={displayed as typeof clip} />
          )}
          {clip.kind === "text" && (
            <span className="truncate px-3 text-[color:var(--ui-text-secondary)]">
              {clip.text}
            </span>
          )}
        </Button>
        {selected &&
          (["in", "out"] as const).map((edge) => (
            <Button
              key={edge}
              variant="ghost"
              disabled={disabled}
              aria-label={t(
                edge === "in"
                  ? "videoEditor.trimStartHandle"
                  : "videoEditor.trimEndHandle",
              )}
              className={cn(
                "edit-trim-handle absolute inset-y-0 h-full w-6 touch-none rounded-none p-0 active:bg-transparent transition-none",
                edge === "in"
                  ? "-left-2 cursor-ew-resize"
                  : "-right-2 cursor-ew-resize",
              )}
              {...events(edge)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                e.preventDefault();
                const next = trimClip(
                  clip,
                  edge,
                  e.key === "ArrowLeft" ? -0.1 : 0.1,
                );
                onCommit(
                  normalizeEdit({
                    ...doc,
                    clips: doc.clips.map((c) => (c.id === clip.id ? next : c)),
                  }),
                );
              }}
            >
              <span className="h-1/3 w-0.5 rounded-full bg-[var(--ui-text-primary)]" />
            </Button>
          ))}
      </div>
    </ClipContextMenu>
  );
}
