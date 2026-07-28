import { Path, Rect } from "fabric";
import { describe, expect, it, vi } from "vitest";
import { applyEraserStroke, colorWithOpacity } from "./PaintTools";

function canvasDouble(objects: any[]) {
  return {
    getObjects: vi.fn(() => objects),
    remove: vi.fn((target: any) => {
      const index = objects.indexOf(target);
      if (index >= 0) objects.splice(index, 1);
    }),
    requestRenderAll: vi.fn(),
  };
}

describe("PaintTools", () => {
  it("combines a hex color with clamped brush opacity", () => {
    expect(colorWithOpacity("#ff2d20", 0.5)).toBe("rgba(255,45,32,0.5)");
    expect(colorWithOpacity("#14b8a6", 2)).toBe("rgba(20,184,166,1)");
  });

  it("adds an inverted local mask without deleting the drawing or touching images", async () => {
    const drawing = new Path("M 0 50 L 100 50", {
      stroke: "#ff2d20",
      strokeWidth: 12,
      fill: "",
    });
    const image = new Rect({ left: 0, top: 0, width: 100, height: 100 });
    const eraser = new Path("M 50 0 L 50 100", {
      stroke: "#000000",
      strokeWidth: 20,
      fill: "",
    });
    Object.assign(drawing, { editorType: "drawing" });
    Object.assign(image, { editorType: "image" });
    const objects = [image, drawing, eraser];
    const canvas = canvasDouble(objects);

    const changed = await applyEraserStroke(canvas as never, eraser);

    expect(changed).toBe(true);
    expect(canvas.remove).toHaveBeenCalledWith(eraser);
    expect(canvas.remove).not.toHaveBeenCalledWith(drawing);
    expect(objects).toContain(drawing);
    expect(drawing.clipPath).toMatchObject({ absolutePositioned: true, inverted: true });
    expect(image.clipPath).toBeUndefined();
    expect(canvas.requestRenderAll).toHaveBeenCalledOnce();
  });

  it("returns false and preserves an existing mask when no drawing intersects", async () => {
    const drawing = new Path("M 0 0 L 20 0", {
      stroke: "#ff2d20",
      strokeWidth: 4,
      fill: "",
    });
    const firstMask = new Rect({ width: 4, height: 4, inverted: true });
    drawing.clipPath = firstMask;
    Object.assign(drawing, { editorType: "drawing" });
    const distantEraser = new Path("M 300 300 L 350 350", {
      stroke: "#000000",
      strokeWidth: 10,
      fill: "",
    });
    const canvas = canvasDouble([drawing, distantEraser]);

    const changed = await applyEraserStroke(canvas as never, distantEraser);

    expect(changed).toBe(false);
    expect(drawing.clipPath).toBe(firstMask);
    expect(canvas.requestRenderAll).not.toHaveBeenCalled();
  });

  it("merges a new eraser stroke with an existing mask", async () => {
    const drawing = new Path("M 0 50 L 100 50", {
      stroke: "#ff2d20",
      strokeWidth: 12,
      fill: "",
    });
    const firstMask = new Rect({ width: 4, height: 4, inverted: true });
    drawing.clipPath = firstMask;
    Object.assign(drawing, { editorType: "drawing" });
    const eraser = new Path("M 50 0 L 50 100", {
      stroke: "#000000",
      strokeWidth: 20,
      fill: "",
    });
    const canvas = canvasDouble([drawing, eraser]);

    expect(await applyEraserStroke(canvas as never, eraser)).toBe(true);
    expect(drawing.clipPath).not.toBe(firstMask);
    expect(drawing.clipPath).toMatchObject({ absolutePositioned: true, inverted: true });
  });
});
