import { describe, expect, it } from "vitest";
import { ImageAngleRig } from "../../index";
import {
  DEFAULT_IMAGE_ANGLE_STATE,
  clampImageAngle,
  getImageAngleCubeScale,
  getImageAngleDragValue,
  normalizeImageAngleState,
  resolveImageAngleDragAxis,
} from "./ImageAngleRig.constants";

describe("ImageAngleRig package surface", () => {
  it("exports the component", () => {
    expect(ImageAngleRig).toBeTypeOf("function");
  });

  it("normalizes angle input to supported limits", () => {
    expect(clampImageAngle("yaw", 120)).toBe(90);
    expect(normalizeImageAngleState({ pitch: -60, zoom: 16, wideAngle: true })).toEqual({
      ...DEFAULT_IMAGE_ANGLE_STATE,
      pitch: -45,
      zoom: 10,
      wideAngle: true,
    });
  });

  it("keeps dominant drags single-axis and enables deliberate diagonals", () => {
    expect(resolveImageAngleDragAxis(0, 0, 0)).toBeNull();
    expect(resolveImageAngleDragAxis(6, 3, 8)).toBeNull();
    expect(resolveImageAngleDragAxis(18, 5, 8)).toBe("yaw");
    expect(resolveImageAngleDragAxis(4, -16, 8)).toBe("pitch");
    expect(resolveImageAngleDragAxis(28, -24, 8)).toBe("both");
    expect(resolveImageAngleDragAxis(90, 10, 8)).toBe("yaw");
    expect(resolveImageAngleDragAxis(10, -90, 8)).toBe("pitch");
  });

  it("maps zoom to whole-cube scale without exceeding the display range", () => {
    expect(getImageAngleCubeScale(0)).toBe(1);
    expect(getImageAngleCubeScale(10)).toBe(2);
    expect(getImageAngleCubeScale(20)).toBe(2);
  });

  it("matches tamen-web defaults and dimension-relative integer drag values", () => {
    expect(DEFAULT_IMAGE_ANGLE_STATE).toEqual({ yaw: 30, pitch: -20, zoom: 0, wideAngle: false });
    const value = { yaw: 0, pitch: 0, zoom: 5, wideAngle: true };
    expect(getImageAngleDragValue(value, 150, 160, 300, 320)).toEqual({ ...value, yaw: -90, pitch: -45 });
    expect(getImageAngleDragValue(value, 300, 320, 600, 640)).toEqual({ ...value, yaw: -90, pitch: -45 });
    expect(getImageAngleDragValue(value, -60, -32, 300, 320)).toEqual({ ...value, yaw: 36, pitch: 9 });
    expect(getImageAngleDragValue(value, 30, 10, 300, 320)).toEqual({ ...value, yaw: -18, pitch: -3 });
    expect(getImageAngleDragValue(value, -999, -999, 300, 320)).toEqual({ ...value, yaw: 90, pitch: 45 });
    expect(getImageAngleDragValue(value, 20, 20, 0, 0)).toEqual(value);
  });

});
