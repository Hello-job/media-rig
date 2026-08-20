import { describe, expect, it, vi } from "vitest";
import { CropSession } from "./CropSession";

function imageDouble() {
  return {
    cropX: 10,
    cropY: 20,
    width: 400,
    height: 300,
    scaleX: 1,
    scaleY: 1,
    left: 100,
    top: 100,
    set: vi.fn(function (this: any, options: Record<string, unknown>) {
      Object.assign(this, options);
      return this;
    }),
    setCoords: vi.fn(),
    getElement: () => ({ naturalWidth: 1000, naturalHeight: 800 }),
  };
}

describe("CropSession", () => {
  it("restores the exact starting state on cancel", () => {
    const image = imageDouble();
    const session = CropSession.start(image as never);
    session.pan(30, -10);
    session.zoom(1.2);
    session.cancel();
    expect(image).toMatchObject({
      cropX: 10,
      cropY: 20,
      width: 400,
      height: 300,
      scaleX: 1,
      scaleY: 1,
      left: 100,
      top: 100,
    });
  });

  it("clamps crop offsets and reports a confirmed change", () => {
    const image = imageDouble();
    const session = CropSession.start(image as never);
    session.pan(2000, 2000);
    expect(image.cropX).toBe(600);
    expect(image.cropY).toBe(500);
    expect(session.confirm()).toEqual({ changed: true });
  });
});
