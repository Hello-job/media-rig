import type { Canvas as FabricCanvas, FabricObject } from "fabric";

export type FabricSnapshot = string;

export function buildAnnotationBrushCursor(strokeWidth: number, color: string) {
  const size = Math.max(8, Math.min(32, Math.round(strokeWidth + 6)));
  const radius = Math.max(1.5, strokeWidth / 2);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'><circle cx='${size / 2}' cy='${size / 2}' r='${radius}' fill='${color}' stroke='white' stroke-width='1'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg).replace(/'/g, "%27")}") ${size / 2} ${size / 2}, crosshair`;
}

export function serializeAnnotationCanvas(
  canvas: FabricCanvas,
): FabricSnapshot {
  const snapshot = canvas.toJSON() as {
    objects?: Array<Record<string, unknown>>;
  };
  snapshot.objects?.forEach((object) => {
    object.selectable = true;
    object.evented = true;
  });
  return JSON.stringify(snapshot);
}

export function isFabricTextObject(object: FabricObject) {
  return object.type.toLowerCase().replace("-", "") === "itext";
}

export function getFabricSelectionObjects(
  canvas: FabricCanvas,
): FabricObject[] {
  const active = canvas.getActiveObject();
  if (!active) return [];
  if (active.type.toLowerCase() === "activeselection") {
    return (
      active as FabricObject & { getObjects: () => FabricObject[] }
    ).getObjects();
  }
  return [active];
}
