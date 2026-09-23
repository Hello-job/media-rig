import { useEffect, useMemo, useRef, useState } from "react";
import { useFrameCallback } from "./use-frame-callback";
import { Eye, EyeOff, Volume2, VolumeX } from "lucide-react";
import { useI18n, useVideoEditorServices } from "./video-editor-context";
import { createThumbnailCache } from "./thumbnail-cache";
import {
  clipDuration,
  editDuration,
  formatClock,
  timelineRows,
} from "./timeline";
import { EditIconButton } from "./edit-icon-button";
import { TimelineClip } from "./timeline-clip";
import type { VideoEditDocument } from "./types";

export function EditTimeline({
  doc,
  selected,
  time,
  disabled,
  playing,
  zoom,
  snapping,
  fitRevision,
  onZoom,
  onSelect,
  onSeek,
  onCommit,
}: {
  doc: VideoEditDocument;
  selected: string | null;
  time: number;
  disabled: boolean;
  playing: boolean;
  zoom: number;
  snapping: boolean;
  fitRevision: number;
  onZoom: (zoom: number) => void;
  onSelect: (id: string) => void;
  onSeek: (time: number) => void;
  onCommit: (doc: VideoEditDocument) => void;
}) {
  const { t } = useI18n();
  const scroller = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState(800);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scroll = useFrameCallback(setScrollLeft);
  const { loadThumbnails } = useVideoEditorServices();
  const thumbnails = useMemo(
    () => (loadThumbnails ? createThumbnailCache(loadThumbnails) : null),
    [loadThumbnails],
  );
  useEffect(() => () => thumbnails?.dispose(), [thumbnails]);
  const visibleRange = useMemo(
    () => ({
      start: Math.max(0, scrollLeft - 192) / zoom,
      end: (scrollLeft + viewport + 192) / zoom,
    }),
    [scrollLeft, viewport, zoom],
  );
  const duration = editDuration(doc);
  const rows = useMemo(() => timelineRows(doc), [doc]);
  const length = Math.max(duration + 2, viewport / zoom);
  const lastFit = useRef(fitRevision);
  const videoCount = doc.clips.filter((clip) => clip.kind === "video").length;
  const previousVideoCount = useRef(0);
  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setViewport(Math.max(1, element.clientWidth - 88)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const addedVideo = videoCount > previousVideoCount.current;
    previousVideoCount.current = videoCount;
    if (addedVideo || fitRevision !== lastFit.current) {
      lastFit.current = fitRevision;
      onZoom(
        Math.max(1, Math.min(320, (viewport - 24) / Math.max(1, duration))),
      );
      if (scroller.current) scroller.current.scrollLeft = 0;
    }
  }, [fitRevision, videoCount, duration, viewport, onZoom]);
  useEffect(() => {
    const element = scroller.current;
    if (!element || !playing) return;
    const x = time * zoom;
    if (x > element.scrollLeft + viewport - 40 || x < element.scrollLeft)
      element.scrollLeft = Math.max(0, x - viewport * 0.2);
  }, [time, zoom, playing, viewport]);
  const step = [1, 2, 5, 10, 30, 60, 120].find((s) => s * zoom >= 90) ?? 300;
  const firstTick = Math.floor((visibleRange.start / step) * 10);
  const lastTick = Math.min(
    Math.ceil(length / step) * 10,
    Math.ceil((visibleRange.end / step) * 10),
  );
  const rowHeight = (kind: string) => {
    if (kind === "video") return 60;
    if (kind === "text") return 28;
    return 40;
  };
  const toggleTrack = (id: string, property: "hidden" | "muted") =>
    onCommit({
      ...doc,
      tracks: {
        ...doc.tracks,
        [id]: {
          ...doc.tracks?.[id],
          [property]: !doc.tracks?.[id]?.[property],
        },
      },
    });
  const seek = (x: number, element: HTMLElement) =>
    onSeek(
      Math.max(
        0,
        Math.min(duration, (x - element.getBoundingClientRect().left) / zoom),
      ),
    );
  const scrub = useFrameCallback(seek);
  return (
    <section
      ref={scroller}
      onScroll={(event) => scroll.schedule(event.currentTarget.scrollLeft)}
      className="relative min-h-0 flex-1 select-none overflow-auto"
      aria-label={t("videoEditor.timeline")}
    >
      <div
        className="grid min-h-full"
        style={{
          width: 88 + length * zoom,
          gridTemplateColumns: `88px ${length * zoom}px`,
          gridTemplateRows: `34px ${rows.map((r) => `${rowHeight(r.kind) + 4}px`).join(" ")} minmax(24px,1fr)`,
        }}
      >
        <div
          className="sticky left-0 z-10 bg-[var(--ui-bg-surface)]"
          style={{ gridColumn: 1, gridRow: 1 }}
        />
        <div
          style={{ gridColumn: 2, gridRow: 1 }}
          role="slider"
          tabIndex={0}
          aria-label={t("videoEditor.playhead")}
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={Math.min(time, duration)}
          className="relative touch-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-accent)]"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              onSeek(
                Math.max(
                  0,
                  Math.min(
                    duration,
                    time + (e.key === "ArrowLeft" ? -1 / 30 : 1 / 30),
                  ),
                ),
              );
            }
            if (e.key === "Home") onSeek(0);
            if (e.key === "End") onSeek(duration);
          }}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            e.currentTarget.focus({ preventScroll: true });
            scrub.cancel();
            e.currentTarget.setPointerCapture(e.pointerId);
            seek(e.clientX, e.currentTarget);
          }}
          onPointerMove={(e) => {
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              scrub.schedule(e.clientX, e.currentTarget);
          }}
          onPointerUp={(e) => {
            if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
            scrub.cancel();
            seek(e.clientX, e.currentTarget);
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={scrub.cancel}
          onLostPointerCapture={scrub.cancel}
        >
          {Array.from(
            { length: Math.max(0, lastTick - firstTick) },
            (_, index) => {
              const i = firstTick + index;
              return (
                <span
                  key={i}
                  className="pointer-events-none absolute top-1 border-l border-[var(--ui-border-strong)]"
                  style={{
                    left: (i * step * zoom) / 10,
                    height: i % 10 === 0 ? 12 : 5,
                  }}
                >
                  {i % 10 === 0 && (
                    <span className="absolute left-1 top-3 whitespace-nowrap tabular-nums text-[color:var(--ui-text-muted)]">
                      {formatClock((i * step) / 10)}
                    </span>
                  )}
                </span>
              );
            },
          )}
        </div>
        {rows.map((row, i) => (
          <div
            key={`controls-${row.id}`}
            className="sticky left-0 z-10 flex items-center justify-center gap-1 bg-[var(--ui-bg-surface)] pb-1"
            style={{ gridColumn: 1, gridRow: i + 2 }}
          >
            <EditIconButton
              label={doc.tracks?.[row.id]?.hidden ? "showTrack" : "hideTrack"}
              icon={doc.tracks?.[row.id]?.hidden ? EyeOff : Eye}
              disabled={disabled}
              onClick={() => toggleTrack(row.id, "hidden")}
            />
            <EditIconButton
              label={doc.tracks?.[row.id]?.muted ? "unmute" : "mute"}
              icon={doc.tracks?.[row.id]?.muted ? VolumeX : Volume2}
              disabled={disabled || row.kind === "text"}
              onClick={() => toggleTrack(row.id, "muted")}
            />
          </div>
        ))}
        {rows.map((row, i) => (
          <div
            key={row.id}
            className="relative mb-1"
            style={{
              gridColumn: 2,
              gridRow: i + 2,
              opacity: doc.tracks?.[row.id]?.hidden ? 0.35 : 1,
            }}
          >
            {row.clips
              .filter(
                (clip) =>
                  clip.id === selected ||
                  (clip.start <= visibleRange.end &&
                    clip.start + clipDuration(clip) >= visibleRange.start),
              )
              .map((clip) => (
                <TimelineClip
                  key={clip.id}
                  clip={clip}
                  visibleRange={visibleRange}
                  loadThumbnails={thumbnails?.load}
                  doc={doc}
                  selected={selected === clip.id}
                  zoom={zoom}
                  time={time}
                  snapping={snapping}
                  disabled={disabled}
                  onSelect={onSelect}
                  onCommit={onCommit}
                />
              ))}
          </div>
        ))}
        <div
          className="pointer-events-none relative"
          style={{ gridColumn: 2, gridRow: `1 / ${rows.length + 3}` }}
        >
          <div
            className="absolute inset-y-0 w-px bg-[var(--ui-text-primary)]"
            style={{ left: time * zoom }}
          >
            <span className="absolute -left-1.5 top-0 h-3.5 w-3 rounded-[var(--ui-radius-xs)] bg-[var(--ui-text-primary)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
