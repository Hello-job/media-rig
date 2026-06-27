import { describe, expect, it } from "vitest";
import { clampZoom, containSize, coverSize, fitViewport } from "./geometry";

describe("geometry", () => {
  it("fits a canvas inside the viewport padding", () => {
    expect(
      fitViewport({ width: 1000, height: 700 }, { width: 800, height: 800 }, 48),
    ).toBeCloseTo(0.755);
  });

  it("clamps zoom to the supported range", () => {
    expect(clampZoom(0.01)).toBe(0.1);
    expect(clampZoom(12)).toBe(8);
  });

  it("calculates contain and cover sizes without changing aspect ratio", () => {
    expect(containSize({ width: 2000, height: 1000 }, { width: 800, height: 800 })).toEqual({
      width: 800,
      height: 400,
      scale: 0.4,
    });
    expect(coverSize({ width: 2000, height: 1000 }, { width: 800, height: 800 })).toEqual({
      width: 1600,
      height: 800,
      scale: 0.8,
    });
  });
});
