import { describe, expect, it, vi } from "vitest";
import { DEFAULT_MAX_IMAGE_SIZE } from "../ImageEditor.constants";
import {
  addImageToCanvas,
  fitImageToCanvas,
  flipImage,
  validateImageFile,
} from "./ImageService";

const { fromURL } = vi.hoisted(() => ({ fromURL: vi.fn() }));

vi.mock("fabric", () => ({
  FabricImage: { fromURL },
}));

function imageDouble() {
  return {
    width: 2000,
    height: 1000,
    scaleX: 1,
    scaleY: 1,
    flipX: false,
    flipY: false,
    set: vi.fn(function (this: any, options: Record<string, unknown>) {
      Object.assign(this, options);
      return this;
    }),
    setCoords: vi.fn(),
  };
}

describe("ImageService", () => {
  it("accepts supported formats and rejects type and size violations", () => {
    expect(() => validateImageFile(new File(["x"], "x.png", { type: "image/png" }))).not.toThrow();
    expect(() => validateImageFile(new File(["x"], "x.svg", { type: "image/svg+xml" }))).toThrow(
      "不支持的图片格式",
    );
    const large = new File([new Uint8Array(DEFAULT_MAX_IMAGE_SIZE + 1)], "large.png", {
      type: "image/png",
    });
    expect(() => validateImageFile(large)).toThrow("图片不能超过 15 MB");
  });

  it("loads and centers a URL image within 80 percent of the canvas", async () => {
    const image = imageDouble();
    fromURL.mockResolvedValueOnce(image);
    const canvas = {
      getWidth: () => 1000,
      getHeight: () => 800,
      add: vi.fn(),
      centerObject: vi.fn(),
      setActiveObject: vi.fn(),
      requestRenderAll: vi.fn(),
    };
    const id = await addImageToCanvas(canvas as never, "https://example.com/photo.jpg");
    expect(fromURL).toHaveBeenCalledWith(
      "https://example.com/photo.jpg",
      { crossOrigin: "anonymous" },
    );
    expect(image.scaleX).toBeCloseTo(0.4);
    expect(image.scaleY).toBeCloseTo(0.4);
    expect(id).toBeTruthy();
    expect(canvas.add).toHaveBeenCalledWith(image);
  });

  it("contains, covers, and flips an image", () => {
    const image = imageDouble();
    const canvas = { getWidth: () => 800, getHeight: () => 800 };
    fitImageToCanvas(image as never, canvas as never, "contain");
    expect(image.scaleX).toBe(0.4);
    fitImageToCanvas(image as never, canvas as never, "cover");
    expect(image.scaleX).toBe(0.8);
    flipImage(image as never, "x");
    flipImage(image as never, "y");
    expect(image).toMatchObject({ flipX: true, flipY: true });
  });
});
