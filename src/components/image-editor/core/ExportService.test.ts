import { describe, expect, it, vi } from "vitest";
import type { ImageEditorDocument } from "../ImageEditor.types";
import { exportCanvas } from "./ExportService";

const document: ImageEditorDocument = {
  version: 1,
  canvas: { width: 1000, height: 800, background: "#ff0000" },
  objects: [],
};

describe("ExportService", () => {
  it("exports at the requested scale and restores canvas state", async () => {
    const active = { id: "selected" };
    const canvas = {
      backgroundColor: "#ff0000",
      getActiveObject: vi.fn(() => active),
      discardActiveObject: vi.fn(),
      setActiveObject: vi.fn(),
      requestRenderAll: vi.fn(),
      toDataURL: vi.fn(() => "data:image/png;base64,AA=="),
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(new Blob(["ok"], { type: "image/png" })),
    );
    const result = await exportCanvas(canvas as never, document, {
      format: "png",
      width: 2000,
      transparent: true,
    });
    expect(result).toBeInstanceOf(Blob);
    expect(canvas.toDataURL).toHaveBeenCalledWith({ format: "png", quality: 1, multiplier: 2 });
    expect(canvas.backgroundColor).toBe("#ff0000");
    expect(canvas.setActiveObject).toHaveBeenCalledWith(active);
    fetchSpy.mockRestore();
  });

  it("restores state when export fails", async () => {
    const canvas = {
      backgroundColor: "#ff0000",
      getActiveObject: vi.fn(() => null),
      discardActiveObject: vi.fn(),
      requestRenderAll: vi.fn(),
      toDataURL: vi.fn(() => {
        throw new DOMException("tainted", "SecurityError");
      }),
    };
    await expect(exportCanvas(canvas as never, document, { format: "jpeg" })).rejects.toMatchObject({
      code: "EXPORT_CORS_FAILED",
    });
    expect(canvas.backgroundColor).toBe("#ff0000");
  });
});
