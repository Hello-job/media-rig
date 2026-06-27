import type { Canvas, FabricObject } from "fabric";
import type { EditableFabricObject } from "../utils/editorObject";

export function eraseDrawingTarget(canvas: Canvas, target?: FabricObject | null) {
  if (!target || (target as EditableFabricObject).editorType !== "drawing") return false;
  canvas.remove(target);
  canvas.requestRenderAll();
  return true;
}
