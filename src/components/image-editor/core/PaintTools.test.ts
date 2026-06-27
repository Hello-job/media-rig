import { Rect } from "fabric";
import { describe, expect, it, vi } from "vitest";
import { eraseDrawingTarget } from "./PaintTools";

describe("PaintTools", () => {
  it("only erases freehand drawing objects", () => {
    const canvas = { remove: vi.fn(), requestRenderAll: vi.fn() };
    const drawing = new Rect();
    const image = new Rect();
    Object.assign(drawing, { editorType: "drawing" });
    Object.assign(image, { editorType: "image" });

    expect(eraseDrawingTarget(canvas as never, image)).toBe(false);
    expect(eraseDrawingTarget(canvas as never, drawing)).toBe(true);
    expect(canvas.remove).toHaveBeenCalledOnce();
    expect(canvas.remove).toHaveBeenCalledWith(drawing);
    expect(canvas.requestRenderAll).toHaveBeenCalledOnce();
  });
});
