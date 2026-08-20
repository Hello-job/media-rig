import { describe, expect, it } from "vitest";
import { ImageAngleRig } from "../../index";
import {
  DEFAULT_IMAGE_ANGLE_STATE,
  clampImageAngle,
  getImageAngleCubeScale,
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
    expect(getImageAngleCubeScale(10)).toBe(1.35);
    expect(getImageAngleCubeScale(20)).toBe(1.35);
  });
});
