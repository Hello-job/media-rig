import type { MediaClip } from "./types";

export function audioEnvelope(clip: MediaClip) {
  const range = clip.fadeRange ?? clip;
  const duration = (range.out - range.in) / range.speed;
  return {
    offset: (clip.in - range.in) / range.speed,
    rate: clip.speed / range.speed,
    duration,
    fadeIn: Math.min(clip.fadeIn, duration),
    fadeOut: Math.min(clip.fadeOut, duration),
  };
}
