import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoTrimRange } from "./trim-range";

export function useTrimPreview(video: HTMLVideoElement, loop: boolean) {
  const [duration, setDuration] = useState(0);
  const [range, setRange] = useState<VideoTrimRange>([0, 0]);
  const [error, setError] = useState(false);
  const rangeRef = useRef(range);
  const loopRef = useRef(loop);
  const dragging = useRef(false);
  const resume = useRef(false);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  useEffect(() => {
    const previousTime = video.currentTime;
    video.pause();
    const metadata = () => {
      const length = Number.isFinite(video.duration) ? video.duration : 0;
      setDuration(length);
      const next: VideoTrimRange = [0, Math.min(5, length)];
      rangeRef.current = next;
      setRange(next);
      setError(length <= 0);
    };
    if (video.readyState >= 1) metadata();
    video.addEventListener("loadedmetadata", metadata);
    const failed = () => setError(true);
    video.addEventListener("error", failed);
    let frame = 0;
    const sync = () => {
      const [start, end] = rangeRef.current;
      if (
        loopRef.current &&
        !dragging.current &&
        end > start &&
        !video.seeking
      ) {
        if ((!video.paused || video.ended) && video.currentTime >= end) {
          video.currentTime = start;
          if (video.paused) void video.play().catch(failed);
        } else if (!video.paused && video.currentTime < start) {
          video.currentTime = start;
        }
      }
    };
    const tick = () => {
      sync();
      frame = requestAnimationFrame(tick);
    };
    const onPlay = () => {
      const [start, end] = rangeRef.current;
      if (
        loopRef.current &&
        (video.currentTime < start || video.currentTime >= end)
      )
        video.currentTime = start;
      sync();
    };
    video.addEventListener("play", onPlay);
    video.addEventListener("timeupdate", sync);
    video.addEventListener("ended", sync);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      video.removeEventListener("loadedmetadata", metadata);
      video.removeEventListener("error", failed);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("timeupdate", sync);
      video.removeEventListener("ended", sync);
      if (loopRef.current) {
        video.pause();
        if (video.readyState >= 1) video.currentTime = previousTime;
      }
    };
  }, [video]);

  const changeRange = useCallback(
    (next: VideoTrimRange, previewEnd = false) => {
      rangeRef.current = next;
      setRange(next);
      video.currentTime = previewEnd
        ? Math.max(next[0], next[1] - 0.001)
        : next[0];
    },
    [video],
  );
  const beginDrag = () => {
    dragging.current = true;
    resume.current = !video.paused;
    video.pause();
  };
  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    video.currentTime = rangeRef.current[0];
    if (resume.current) void video.play().catch(() => setError(true));
  };
  return {
    duration,
    range,
    changeRange,
    beginDrag,
    endDrag,
    error,
  };
}
