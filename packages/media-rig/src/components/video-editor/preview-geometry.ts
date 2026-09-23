import type { MediaClip } from "./types";

export function videoBounds(clip: MediaClip, width: number, height: number) {
  const transform = clip.transform ?? { x: 0.5, y: 0.5, scale: 1 };
  const fit = Math.min(width / clip.source.width, height / clip.source.height);
  const w = clip.source.width * fit * transform.scale;
  const h = clip.source.height * fit * transform.scale;
  return {
    x: transform.x * width - w / 2,
    y: transform.y * height - h / 2,
    width: w,
    height: h,
  };
}
