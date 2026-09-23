import { useEffect, useRef } from "react";
import { useI18n } from "./video-editor-context";
import {
  audioGain,
  clipDuration,
  clipHidden,
  clipMuted,
  editDuration,
  outputSize,
} from "./timeline";
import { videoBounds } from "./preview-geometry";
import { drawEditText } from "./draw-text";
import type { VideoEditDocument } from "./types";

export function EditPreview({
  doc,
  time,
  playing,
  onTime,
  onStop,
  onError,
}: {
  doc: VideoEditDocument;
  time: number;
  playing: boolean;
  onTime: (time: number) => void;
  onStop: () => void;
  onError: () => void;
}) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latest = useRef({ doc, time, playing, onTime, onStop, onError });
  useEffect(() => {
    latest.current = { doc, time, playing, onTime, onStop, onError };
  }, [doc, time, playing, onTime, onStop, onError]);
  const first = doc.clips.find((c) => c.kind === "video");
  const size =
    first?.kind === "video"
      ? outputSize(first.source.width, first.source.height)
      : { width: 1920, height: 1080 };
  const mediaKey = JSON.stringify(
    doc.clips
      .flatMap((clip) =>
        clip.kind === "text"
          ? []
          : [{ id: clip.id, kind: clip.kind, url: clip.source.url }],
      )
      .sort((a, b) => a.id.localeCompare(b.id)),
  );
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let disposed = false;
    let failed = false;
    const fail = () => {
      if (disposed || failed) return;
      failed = true;
      latest.current.onStop();
      latest.current.onError();
    };
    const elements = new Map<string, HTMLMediaElement>();
    const prepared = new Set<string>();
    const pendingPlay = new Set<string>();
    const frameCallbacks = new Map<HTMLVideoElement, number>();
    let newVideoFrame = true;
    const watchFrames = (video: HTMLVideoElement) => {
      if (!video.requestVideoFrameCallback) return;
      frameCallbacks.set(
        video,
        video.requestVideoFrameCallback(() => {
          if (disposed) return;
          newVideoFrame = true;
          watchFrames(video);
        }),
      );
    };
    latest.current.doc.clips.forEach((clip) => {
      if (clip.kind === "text") return;
      const media = document.createElement(
        clip.kind === "video" ? "video" : "audio",
      );
      media.preload = "metadata";
      if (media instanceof HTMLVideoElement) media.playsInline = true;
      media.src = clip.source.url;
      media.onerror = fail;
      media.onloadeddata = media.onseeked = () => {
        newVideoFrame = true;
      };
      elements.set(clip.id, media);
      if (media instanceof HTMLVideoElement) watchFrames(media);
    });
    let current = latest.current.time;
    let lastReported = current;
    let lastReportAt = 0;
    let previousPlaying = false;
    let drawnDoc: VideoEditDocument | null = null;
    let drawnTime = -1;
    let drawnText = "";
    let frame = 0;
    const tick = (now: number) => {
      const state = latest.current;
      const doc = state.doc;
      const duration = editDuration(doc);
      if (
        (!state.playing && (!previousPlaying || state.time !== lastReported)) ||
        (state.playing && !previousPlaying)
      )
        current = state.time;
      if (state.playing && !previousPlaying) prepared.clear();
      const justPaused = previousPlaying && !state.playing;
      if (!state.playing && !justPaused) lastReported = state.time;
      previousPlaying = state.playing;
      const masterClip = doc.clips.find(
        (c) =>
          c.kind === "video" &&
          current >= c.start &&
          current < c.start + clipDuration(c),
      );
      const master = masterClip && elements.get(masterClip.id);
      // Native decoded media time is authoritative; never seek a playing video to a JS clock.
      if (
        state.playing &&
        masterClip?.kind === "video" &&
        master &&
        prepared.has(masterClip.id) &&
        !master.seeking
      ) {
        current =
          masterClip.start +
          Math.max(0, master.currentTime - masterClip.in) / masterClip.speed;
        if (master.ended) current = masterClip.start + clipDuration(masterClip);
        current = Math.min(duration, current);
        if (current >= duration) state.onStop();
      }
      const shouldReport =
        justPaused ||
        (state.playing && (now - lastReportAt >= 100 || current >= duration));
      if (shouldReport && current !== lastReported) {
        lastReported = current;
        lastReportAt = now;
        state.onTime(current);
      }
      const renderTime = Math.min(current, Math.max(0, duration - 1 / 30));
      const visibleText = doc.clips
        .filter(
          (c) =>
            c.kind === "text" &&
            renderTime >= c.start &&
            renderTime < c.start + c.duration,
        )
        .map((c) => c.id)
        .join("|");
      const draw =
        drawnText !== visibleText ||
        drawnDoc !== doc ||
        (!state.playing && drawnTime !== renderTime) ||
        newVideoFrame ||
        (state.playing &&
          master instanceof HTMLVideoElement &&
          !master.requestVideoFrameCallback);
      const videoClip = doc.clips.find(
        (clip) =>
          clip.kind === "video" &&
          renderTime >= clip.start &&
          renderTime < clip.start + clipDuration(clip),
      );
      const video = videoClip && elements.get(videoClip.id);
      const hidden = videoClip && clipHidden(doc, videoClip);
      // Keep the last complete composition until the requested video can be drawn.
      // Draw before starting the next seek, which can immediately drop readyState.
      if (
        draw &&
        (!videoClip ||
          hidden ||
          (video && video.readyState >= 2 && !video.seeking))
      ) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (
          videoClip?.kind === "video" &&
          video instanceof HTMLVideoElement &&
          !hidden
        ) {
          const bounds = videoBounds(videoClip, canvas.width, canvas.height);
          ctx.drawImage(video, bounds.x, bounds.y, bounds.width, bounds.height);
        }
        doc.clips.forEach((clip) => {
          if (
            clip.kind === "text" &&
            !clipHidden(doc, clip) &&
            renderTime >= clip.start &&
            renderTime < clip.start + clip.duration
          )
            drawEditText(ctx, clip, canvas.width, canvas.height);
        });
        drawnDoc = doc;
        drawnTime = renderTime;
        drawnText = visibleText;
        newVideoFrame = false;
      }
      doc.clips.forEach((clip) => {
        if (clip.kind === "text") return;
        const media = elements.get(clip.id)!;
        const visible =
          renderTime >= clip.start &&
          renderTime < clip.start + clipDuration(clip);
        if (!visible) {
          if (!media.paused) media.pause();
          prepared.delete(clip.id);
          // Only warm the upcoming clip, instead of downloading every source at once.
          if (
            clip.kind === "video" &&
            clip.start > current &&
            clip.start - current < 1
          )
            media.preload = "auto";
          return;
        }
        media.preload = "auto";
        const position = clip.in + (renderTime - clip.start) * clip.speed;
        if (media.readyState >= 1 && !media.seeking) {
          const entering = !prepared.has(clip.id);
          const syncAudio =
            clip.kind === "audio" &&
            Math.abs(media.currentTime - position) > 0.25;
          if (
            (entering || !state.playing || syncAudio) &&
            Math.abs(media.currentTime - position) > 0.015
          )
            media.currentTime = position;
          prepared.add(clip.id);
        }
        media.playbackRate = clip.speed;
        media.volume = clipMuted(doc, clip)
          ? 0
          : Math.max(0, Math.min(1, audioGain(clip, current)));
        const masterWaiting =
          !master || master.readyState < 2 || master.seeking || master.paused;
        const canPlay =
          state.playing &&
          current < duration &&
          media.readyState >= 2 &&
          !media.seeking &&
          !failed &&
          (clip.kind === "video" || !masterWaiting);
        if (canPlay && media.paused && !pendingPlay.has(clip.id)) {
          pendingPlay.add(clip.id);
          void media
            .play()
            .catch((error: unknown) => {
              if (
                !disposed &&
                !(error instanceof DOMException && error.name === "AbortError")
              )
                fail();
            })
            .finally(() => pendingPlay.delete(clip.id));
        }
        if (
          (!state.playing ||
            current >= duration ||
            (clip.kind === "audio" && masterWaiting)) &&
          !media.paused
        )
          media.pause();
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      frameCallbacks.forEach((id, video) => video.cancelVideoFrameCallback(id));
      elements.forEach((media) => {
        media.pause();
        media.onerror = null;
        media.onloadeddata = media.onseeked = null;
        media.removeAttribute("src");
        media.load();
      });
    };
  }, [mediaKey]);
  return (
    <canvas
      ref={canvasRef}
      width={size.width}
      height={size.height}
      aria-label={t("videoEditor.preview")}
      className="edit-preview-canvas"
      style={{ aspectRatio: `${size.width}/${size.height}` }}
    />
  );
}
