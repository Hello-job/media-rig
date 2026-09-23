import type { TextClip } from "./types";

/** Half-open intervals mirror preview visibility, including gaps and overlapping text. */
export function textOverlayFrames(clips: TextClip[], duration: number) {
  const points = [
    ...new Set([
      0,
      duration,
      ...clips.flatMap((clip) => [
        Math.max(0, Math.min(duration, clip.start)),
        Math.max(0, Math.min(duration, clip.start + clip.duration)),
      ]),
    ]),
  ].sort((a, b) => a - b);
  return points.map((time, index) => ({
    time,
    duration: (points[index + 1] ?? duration) - time,
    clips: clips.filter(
      (clip) => clip.start <= time && clip.start + clip.duration > time,
    ),
  }));
}
