import type { ImageAngleState } from "./ImageAngleRig.types";

export const DEFAULT_IMAGE_ANGLE_STATE: ImageAngleState = {
  yaw: 34,
  pitch: -25,
  zoom: 0,
  wideAngle: false,
};

export const IMAGE_ANGLE_LIMITS = {
  yaw: { min: -90, max: 90, step: 0.5 },
  pitch: { min: -45, max: 45, step: 0.5 },
  zoom: { min: 0, max: 10, step: 0.1 },
} as const;

export type ImageAngleDragAxis = "yaw" | "pitch" | "both";

export function resolveImageAngleDragAxis(
  deltaX: number,
  deltaY: number,
  threshold = 8,
): ImageAngleDragAxis | null {
  const safeThreshold = Math.max(0, threshold);
  const absoluteX = Math.abs(deltaX);
  const absoluteY = Math.abs(deltaY);
  const majorDistance = Math.max(absoluteX, absoluteY);
  const minorDistance = Math.min(absoluteX, absoluteY);

  if (majorDistance === 0 || majorDistance < safeThreshold) return null;
  if (
    minorDistance >= safeThreshold
    && majorDistance / Math.max(minorDistance, Number.EPSILON) < 2
  ) {
    return "both";
  }
  return absoluteX >= absoluteY ? "yaw" : "pitch";
}

export function getImageAngleCubeScale(zoom: number) {
  return 1 + clampImageAngle("zoom", zoom) * 0.035;
}

export function clampImageAngle(
  key: "yaw" | "pitch" | "zoom",
  value: number,
) {
  const limits = IMAGE_ANGLE_LIMITS[key];
  return Math.min(limits.max, Math.max(limits.min, value));
}

export function normalizeImageAngleState(
  value?: Partial<ImageAngleState>,
): ImageAngleState {
  return {
    yaw: clampImageAngle("yaw", value?.yaw ?? DEFAULT_IMAGE_ANGLE_STATE.yaw),
    pitch: clampImageAngle("pitch", value?.pitch ?? DEFAULT_IMAGE_ANGLE_STATE.pitch),
    zoom: clampImageAngle("zoom", value?.zoom ?? DEFAULT_IMAGE_ANGLE_STATE.zoom),
    wideAngle: value?.wideAngle ?? DEFAULT_IMAGE_ANGLE_STATE.wideAngle,
  };
}
