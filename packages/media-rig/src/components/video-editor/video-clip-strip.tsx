import { memo, useEffect, useState } from "react";
import type { MediaClip, VideoEditorServices } from "./types";

function VideoClipStripView({
  clip,
  width,
  visibleFrom = 0,
  visibleTo = width,
  loadThumbnails,
}: {
  clip: MediaClip;
  width: number;
  visibleFrom?: number;
  visibleTo?: number;
  loadThumbnails?: VideoEditorServices["loadThumbnails"];
}) {
  const [strip, setStrip] = useState<{ url: string; frames: string[] } | null>(
    null,
  );
  useEffect(() => {
    if (!loadThumbnails) return;
    const controller = new AbortController();
    void loadThumbnails(clip.source.url, controller.signal)
      .then((frames) => {
        if (!controller.signal.aborted)
          setStrip({ url: clip.source.url, frames });
      })
      .catch(() => {
        // Thumbnails are optional; the clip label remains usable when CORS blocks extraction.
      });
    return () => controller.abort();
  }, [clip.source.url, loadThumbnails]);
  if (!strip || strip.url !== clip.source.url || !strip.frames.length)
    return (
      <span className="truncate px-3 text-[color:var(--ui-text-secondary)]">
        {clip.source.label}
      </span>
    );
  const count = Math.max(1, Math.ceil(width / 96));
  const tileWidth = width / count;
  const first = Math.max(0, Math.floor(visibleFrom / tileWidth));
  const last = Math.min(count, Math.ceil(visibleTo / tileWidth));
  const visible = Array.from(
    { length: Math.max(0, last - first) },
    (_, offset) => {
      const index = first + offset;
      const at = clip.in + ((clip.out - clip.in) * (index + 0.5)) / count;
      return strip.frames[
        Math.min(
          strip.frames.length - 1,
          Math.floor((at / clip.source.duration) * strip.frames.length),
        )
      ];
    },
  );
  return (
    <span
      className="pointer-events-none absolute inset-0 flex overflow-hidden"
      aria-hidden="true"
    >
      {visible.map((src, index) => (
        <img
          key={first + index}
          src={src}
          alt=""
          draggable={false}
          className="absolute h-full object-cover"
          style={{ left: (first + index) * tileWidth, width: tileWidth }}
        />
      ))}
    </span>
  );
}

export const VideoClipStrip = memo(VideoClipStripView);
