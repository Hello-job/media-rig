import type { Size } from "../utils/geometry";

export type Bounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type SnapResult = {
  left: number;
  top: number;
  verticalGuide?: number;
  horizontalGuide?: number;
};

function axisPoints(start: number, size: number) {
  return [start + size / 2, start, start + size];
}

function findOffset(moving: number[], targets: number[], threshold: number) {
  for (const target of targets) {
    for (const point of moving) {
      const difference = target - point;
      if (Math.abs(difference) <= threshold) return { difference, guide: target };
    }
  }
  return null;
}

export function calculateSnapPosition(
  moving: Bounds,
  others: Bounds[],
  canvas: Size,
  threshold: number,
  disabled = false,
): SnapResult {
  if (disabled) return { left: moving.left, top: moving.top };
  const xTargets = [canvas.width / 2];
  const yTargets = [canvas.height / 2];
  for (const other of others) {
    const x = axisPoints(other.left, other.width);
    const y = axisPoints(other.top, other.height);
    xTargets.push(x[0], x[1], x[2]);
    yTargets.push(y[0], y[1], y[2]);
  }
  const xSnap = findOffset(axisPoints(moving.left, moving.width), xTargets, threshold);
  const ySnap = findOffset(axisPoints(moving.top, moving.height), yTargets, threshold);
  return {
    left: moving.left + (xSnap?.difference ?? 0),
    top: moving.top + (ySnap?.difference ?? 0),
    ...(xSnap ? { verticalGuide: xSnap.guide } : {}),
    ...(ySnap ? { horizontalGuide: ySnap.guide } : {}),
  };
}
