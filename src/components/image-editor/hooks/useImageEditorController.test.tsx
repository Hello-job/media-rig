import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ImageEditorDocument } from "../ImageEditor.types";
import { useImageEditorController } from "./useImageEditorController";

const { fabricState } = vi.hoisted(() => ({
  fabricState: { canvas: null as any, zoom: 1 },
}));

vi.mock("./useFabricCanvas", () => ({
  useFabricCanvas: () => ({
    canvas: fabricState.canvas,
    canvasElementRef: { current: null },
    viewportRef: { current: null },
    zoom: fabricState.zoom,
    setZoom: vi.fn(),
    fitToViewport: vi.fn(),
  }),
}));

const stored: ImageEditorDocument = {
  version: 1,
  canvas: { width: 1200, height: 800, background: "#123456" },
  objects: [],
};

describe("useImageEditorController", () => {
  beforeEach(() => {
    localStorage.clear();
    fabricState.canvas = null;
    fabricState.zoom = 1;
  });

  it("uses an initial document without mutating the caller value", () => {
    const initial = structuredClone(stored);
    const { result } = renderHook(() => useImageEditorController({ initialDocument: initial }));
    result.current.document.canvas.background = "#ffffff";
    expect(initial.canvas.background).toBe("#123456");
  });

  it("prefers a valid stored document when storage is enabled", () => {
    localStorage.setItem("editor", JSON.stringify(stored));
    const { result } = renderHook(() => useImageEditorController({ storageKey: "editor" }));
    expect(result.current.document.canvas).toEqual(stored.canvas);
  });

  it("falls back safely when stored JSON is invalid", () => {
    localStorage.setItem("editor", "not-json");
    const onError = vi.fn();
    const { result } = renderHook(() => useImageEditorController({ storageKey: "editor", onError }));
    expect(result.current.document.version).toBe(1);
    expect(onError).toHaveBeenCalledOnce();
  });

  it("does not reload the document when viewport zoom changes", async () => {
    const canvas = {
      backgroundColor: "",
      setDimensions: vi.fn(),
      loadFromJSON: vi.fn().mockResolvedValue(undefined),
      getObjects: vi.fn(() => []),
      requestRenderAll: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      getWidth: () => 1024,
      getHeight: () => 1024,
    };
    fabricState.canvas = canvas;
    const { rerender } = renderHook(() => useImageEditorController());
    await waitFor(() => expect(canvas.loadFromJSON).toHaveBeenCalledOnce());
    fabricState.zoom = 2;
    rerender();
    await Promise.resolve();
    expect(canvas.loadFromJSON).toHaveBeenCalledOnce();
  });
});
