export type VideoTrimRange = [number, number];
export type VideoTrimHandle = "start" | "end" | "move";

export function adjustVideoTrimRange(
  range: VideoTrimRange,
  handle: VideoTrimHandle,
  delta: number,
  duration: number,
  snap: boolean,
): VideoTrimRange {
  const minimum = Math.min(0.1, duration);
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));
  const target = (value: number) => (snap ? Math.round(value) : value);
  if (handle === "start")
    return [clamp(target(range[0] + delta), 0, range[1] - minimum), range[1]];
  if (handle === "end")
    return [
      range[0],
      clamp(target(range[1] + delta), range[0] + minimum, duration),
    ];
  const length = range[1] - range[0];
  const start = clamp(target(range[0] + delta), 0, duration - length);
  return [start, start + length];
}
