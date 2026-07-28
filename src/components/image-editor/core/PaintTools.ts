import {
  Circle,
  Group,
  Point,
  type Canvas,
  type FabricObject,
  type Path,
  util,
} from "fabric";
import type { EditableFabricObject } from "../utils/editorObject";

const HEX_COLOR = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i;

export function colorWithOpacity(hex: string, opacity: number) {
  const match = HEX_COLOR.exec(hex);
  const alpha = Math.min(1, Math.max(0, opacity));
  if (!match) return hex;
  const [, red, green, blue] = match;
  return `rgba(${Number.parseInt(red, 16)},${Number.parseInt(green, 16)},${Number.parseInt(blue, 16)},${alpha})`;
}

function isDrawing(object: FabricObject): object is EditableFabricObject {
  return (object as EditableFabricObject).editorType === "drawing";
}

function createFilledEraserMask(eraserPath: Path) {
  const infos = util.getPathSegmentsInfo(eraserPath.path);
  const totalLength = infos[infos.length - 1]?.length ?? 0;
  const radius = Math.max((eraserPath.strokeWidth ?? 1) / 2, 0.5);
  const sampleCount = Math.min(512, Math.max(1, Math.ceil(totalLength / Math.max(radius, 1))));
  const transform = eraserPath.calcTransformMatrix();
  const circles = Array.from({ length: sampleCount + 1 }, (_, index) => {
    const distance = totalLength * (index / sampleCount);
    const pathPoint = util.getPointOnPath(eraserPath.path, distance, infos) ?? {
      x: eraserPath.pathOffset.x,
      y: eraserPath.pathOffset.y,
    };
    const canvasPoint = util.transformPoint(
      new Point(
        pathPoint.x - eraserPath.pathOffset.x,
        pathPoint.y - eraserPath.pathOffset.y,
      ),
      transform,
    );
    return new Circle({
      fill: "#000000",
      left: canvasPoint.x,
      top: canvasPoint.y,
      originX: "center",
      originY: "center",
      radius,
      strokeWidth: 0,
    });
  });
  return new Group(circles, {
    evented: false,
    inverted: true,
    selectable: false,
  });
}

export async function applyEraserStroke(canvas: Canvas, eraserPath: Path) {
  const drawings = canvas
    .getObjects()
    .filter(isDrawing)
    .filter((drawing) => drawing.intersectsWithObject(eraserPath));

  canvas.remove(eraserPath);
  if (drawings.length === 0) return false;

  await Promise.all(
    drawings.map(async (drawing) => {
      const mask = createFilledEraserMask(eraserPath);
      mask.absolutePositioned = true;
      const clipPath = drawing.clipPath
        ? util.mergeClipPaths(drawing.clipPath as never, mask as never)
        : mask;
      clipPath.absolutePositioned = true;
      drawing.clipPath = clipPath;
      drawing.dirty = true;
      drawing.setCoords();
    }),
  );
  canvas.requestRenderAll();
  return true;
}
