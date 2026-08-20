import { describe, expect, it, vi } from "vitest";
import type { ImageEditorDocument } from "../ImageEditor.types";
import {
  loadDocumentIntoCanvas,
  serializeCanvas,
  validateDocument,
} from "./DocumentSerializer";

function validDocument(): ImageEditorDocument {
  return {
    version: 1,
    canvas: { width: 1200, height: 800, background: "#ffffff" },
    objects: [
      {
        id: "shape-1",
        type: "rect",
        name: "矩形 1",
        locked: false,
        visible: true,
        fabricData: { type: "Rect", left: 10, top: 20 },
      },
    ],
  };
}

describe("DocumentSerializer", () => {
  it("rejects an unsupported document version", () => {
    expect(() => validateDocument({ version: 2 })).toThrowError("不支持的文档版本");
  });

  it("rejects duplicate object ids", () => {
    const document = validDocument();
    document.objects.push({ ...document.objects[0] });
    expect(() => validateDocument(document)).toThrowError("对象 ID 必须唯一");
  });

  it("serializes stable editor metadata", () => {
    const object = {
      id: "shape-1",
      editorType: "rect" as const,
      name: "矩形 1",
      editorLocked: false,
      visible: true,
      toObject: vi.fn(() => ({
        type: "Rect",
        left: 10,
        id: "shape-1",
        editorType: "rect",
        name: "矩形 1",
        editorLocked: false,
        visible: true,
      })),
    };
    const canvas = { getObjects: () => [object] };

    const document = serializeCanvas(canvas, {
      width: 1200,
      height: 800,
      background: "#ffffff",
    });
    expect(document.objects[0]).toMatchObject({
      id: "shape-1",
      type: "rect",
      name: "矩形 1",
      locked: false,
      visible: true,
      fabricData: { type: "Rect", left: 10 },
    });
  });

  it("loads only after the complete document validates", async () => {
    const object = {
      id: "shape-1",
      editorType: "rect" as const,
      name: "矩形 1",
      editorLocked: false,
      visible: true,
      toObject: vi.fn(() => ({})),
      set: vi.fn(),
      setControlsVisibility: vi.fn(),
    };
    const canvas = {
      setDimensions: vi.fn(),
      loadFromJSON: vi.fn().mockResolvedValue(undefined),
      getObjects: vi.fn(() => [object]),
      requestRenderAll: vi.fn(),
      backgroundColor: "",
    };

    await loadDocumentIntoCanvas(canvas, validDocument());

    expect(canvas.setDimensions).toHaveBeenCalledWith({ width: 1200, height: 800 });
    expect(canvas.loadFromJSON).toHaveBeenCalledOnce();
    expect(canvas.requestRenderAll).toHaveBeenCalledOnce();
  });

  it("does not mutate the canvas when validation fails", async () => {
    const canvas = {
      setDimensions: vi.fn(),
      loadFromJSON: vi.fn(),
      getObjects: vi.fn(() => []),
      requestRenderAll: vi.fn(),
      backgroundColor: "",
    };

    await expect(loadDocumentIntoCanvas(canvas, { version: 2 })).rejects.toThrow();
    expect(canvas.setDimensions).not.toHaveBeenCalled();
    expect(canvas.loadFromJSON).not.toHaveBeenCalled();
  });
});
