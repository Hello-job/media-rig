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
