type DirectorVector3 = [number, number, number];

export type DirectorCameraMotionPresetId =
  | "orbit"
  | "arc"
  | "dolly-in"
  | "dolly-out"
  | "dolly-zoom"
  | "crane-up"
  | "crane-down"
  | "truck"
  | "spiral";

export type DirectorCameraMotionPreset = {
  id: DirectorCameraMotionPresetId;
  label: string;
  description: string;
};

export const DIRECTOR_CAMERA_MOTION_PRESETS: DirectorCameraMotionPreset[] = [
  { id: "orbit", label: "环绕", description: "围绕主体完成一圈运动" },
  { id: "arc", label: "半弧", description: "围绕主体移动半圈" },
  { id: "dolly-in", label: "推近", description: "沿视线靠近主体" },
  { id: "dolly-out", label: "拉远", description: "沿视线远离主体" },
  { id: "dolly-zoom", label: "滑动变焦", description: "推近同时改变焦距" },
  { id: "crane-up", label: "上升", description: "镜头垂直升高" },
  { id: "crane-down", label: "下降", description: "镜头垂直降低" },
  { id: "truck", label: "横移", description: "镜头水平横向移动" },
  { id: "spiral", label: "螺旋", description: "环绕主体并持续上升" },
];

function round(point: DirectorVector3): DirectorVector3 {
  return point.map((value) => Number(value.toFixed(4))) as DirectorVector3;
}

export function createDirectorCameraPresetPositions(
  presetId: DirectorCameraMotionPresetId,
  camera: DirectorVector3,
  center: DirectorVector3,
): DirectorVector3[] {
  const dx = camera[0] - center[0];
  const dz = camera[2] - center[2];
  const radius = Math.max(2, Math.hypot(dx, dz));
  const startAngle = Math.atan2(dz, dx);
  const y = camera[1];

  if (presetId === "orbit" || presetId === "arc" || presetId === "spiral") {
    const span = presetId === "arc" ? Math.PI : Math.PI * 2;
    const count = presetId === "arc" ? 5 : 9;
    return Array.from({ length: count }, (_, index) => {
      const ratio = index / (count - 1);
      const angle = startAngle + span * ratio;
      const height = presetId === "spiral" ? y + ratio * 5 : y;
      return round([
        center[0] + Math.cos(angle) * radius,
        height,
        center[2] + Math.sin(angle) * radius,
      ]);
    });
  }

  const towardCenter: DirectorVector3 = [
    center[0] - camera[0],
    center[1] + 1.2 - camera[1],
    center[2] - camera[2],
  ];
  const length = Math.hypot(...towardCenter) || 1;
  const forward = towardCenter.map(
    (value) => value / length,
  ) as DirectorVector3;
  const endpoint = (distance: number): DirectorVector3 =>
    round(
      camera.map(
        (value, index) => value + forward[index] * distance,
      ) as DirectorVector3,
    );

  if (presetId === "dolly-in" || presetId === "dolly-zoom") {
    return [camera, endpoint(Math.max(2, radius * 0.62))];
  }
  if (presetId === "dolly-out")
    return [camera, endpoint(-Math.max(3, radius * 0.65))];
  if (presetId === "crane-up")
    return [camera, round([camera[0], camera[1] + 5, camera[2]])];
  if (presetId === "crane-down") {
    return [
      camera,
      round([camera[0], Math.max(0.8, camera[1] - 4), camera[2]]),
    ];
  }
  const right: DirectorVector3 = [forward[2], 0, -forward[0]];
  return [
    round(
      camera.map((value, index) => value - right[index] * 4) as DirectorVector3,
    ),
    round(
      camera.map((value, index) => value + right[index] * 4) as DirectorVector3,
    ),
  ];
}
