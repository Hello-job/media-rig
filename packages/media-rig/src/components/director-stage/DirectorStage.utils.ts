import type { DirectorSelection, Vector3Like } from "./DirectorStage.types";

export type AspectRatio = "Auto" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4" | "9:16";

export const ASPECT_RATIOS: AspectRatio[] = ["Auto", "21:9", "16:9", "4:3", "1:1", "3:4", "9:16"];

export function selectionKey(selection: DirectorSelection) {
  return selection ? `${selection.kind}:${selection.id}` : "";
}

export function clampNumber(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback;
}

export function downloadText(fileName: string, text: string, mime = "application/json") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ratioToNumber(ratio: AspectRatio) {
  if (ratio === "Auto") return null;
  const [w, h] = ratio.split(":").map(Number);
  return w / h;
}

export function readVectorInput(vector: Vector3Like, axis: keyof Vector3Like, value: string): Vector3Like {
  return { ...vector, [axis]: clampNumber(Number(value), vector[axis]) };
}

/** Validate before dispatch: reducers run outside the import handler's try/catch. */
export function parseSceneSeed(text: string): import("./DirectorStage.types").ParsedSceneSeed {
  const seed = JSON.parse(text);
  const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
  if (!object(seed)) throw new Error("场景必须是 JSON 对象");
  for (const key of ["characters", "props", "cameras"]) {
    if (!(key in seed)) continue;
    if (!Array.isArray(seed[key])) throw new Error(`${key} 必须是数组`);
    for (const item of seed[key]) {
      if (!object(item)) throw new Error("场景对象格式不正确");
      for (const field of ["position", "rotation", "scale", "lookAt"]) {
        if (!(field in item)) continue;
        if (!object(item[field]) || Object.values(item[field]).some((n) => typeof n !== "number" || !Number.isFinite(n))) throw new Error("坐标必须是有限数字");
      }
      for (const field of ["label", "color", "modelUrl", "bodyType", "propType", "animationMode"]) {
        if (field in item && typeof item[field] !== "string") throw new Error(`${field} 必须是文本`);
      }
      for (const field of ["visible", "locked"]) {
        if (field in item && typeof item[field] !== "boolean") throw new Error(`${field} 必须是布尔值`);
      }
      if ("fov" in item && (typeof item.fov !== "number" || !Number.isFinite(item.fov) || item.fov <= 0 || item.fov >= 180)) throw new Error("视角必须在 0–180 度之间");
      if ("jointAngles" in item && (!object(item.jointAngles) || Object.values(item.jointAngles).some((group) => !object(group) || Object.values(group).some((n) => typeof n !== "number" || !Number.isFinite(n))))) throw new Error("关节参数不正确");
    }
  }
  if ("cameraMotions" in seed) {
    if (!Array.isArray(seed.cameraMotions)) throw new Error("运镜路径必须是数组");
    for (const motion of seed.cameraMotions) {
      if (!object(motion) || typeof motion.id !== "string" || typeof motion.cameraId !== "string" || typeof motion.label !== "string" || typeof motion.duration !== "number" || !Number.isFinite(motion.duration) || motion.duration < 0.5 || typeof motion.start !== "number" || !Number.isFinite(motion.start) || motion.start < 0 || !Array.isArray(motion.points) || motion.points.length < 2 || motion.points.some((point) => !Array.isArray(point) || point.length !== 3 || point.some((n) => typeof n !== "number" || !Number.isFinite(n)))) throw new Error("运镜路径参数不正确");
      if (!object(motion.camera) || !object(motion.camera.position) || !object(motion.camera.lookAt) || ![motion.camera.position.x, motion.camera.position.y, motion.camera.position.z, motion.camera.lookAt.x, motion.camera.lookAt.y, motion.camera.lookAt.z, motion.camera.fov].every((n) => typeof n === "number" && Number.isFinite(n))) throw new Error("运镜机位参数不正确");
    }
  }
  if ("environment" in seed) {
    const env = seed.environment;
    if (!object(env)) throw new Error("环境参数不正确");
    if ("showGround" in env && typeof env.showGround !== "boolean") throw new Error("地面开关不正确");
    if ("skyColor" in env && typeof env.skyColor !== "string") throw new Error("天空色不正确");
    if ("groundOpacity" in env && (typeof env.groundOpacity !== "number" || !Number.isFinite(env.groundOpacity) || env.groundOpacity < 0 || env.groundOpacity > 1)) throw new Error("地面透明度必须在 0–1 之间");
  }
  return seed;
}
