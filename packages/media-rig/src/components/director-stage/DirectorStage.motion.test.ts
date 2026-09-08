import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { defaultCamera } from "./DirectorStage.constants";
import { CAMERA_PRESETS } from "./DirectorStage.menuData";
import { createDirectorCameraPresetPositions } from "./camera-motion-presets";
import { sampleCameraMotion } from "./DirectorStage.motion";
import { useDirectorStage } from "./hooks/useDirectorStage";
import type { DirectorCameraMotion } from "./DirectorStage.types";

describe("tamen camera behavior", () => {
  it("matches the default camera and all fourteen preset shots", () => {
    expect(defaultCamera(0).position).toEqual({ x: 0, y: 2.7, z: 9 });
    expect(defaultCamera(0).lookAt).toEqual({ x: 0, y: 1, z: 0 });
    expect(CAMERA_PRESETS).toHaveLength(14);
    expect(CAMERA_PRESETS.find((preset) => preset.label === "荷兰角")?.camera.roll).toBe(-0.28);
  });
  it("keeps the last camera through both deletion routes", () => {
    const { result } = renderHook(() => useDirectorStage(undefined, false));
    act(() => result.current.dispatch({ type: "removeSelected" }));
    expect(result.current.state.composition.cameras).toHaveLength(1);
    const camera = result.current.state.composition.cameras[0];
    act(() => result.current.dispatch({ type: "removeItem", selection: { kind: "camera", id: camera.id } }));
    expect(result.current.state.composition.cameras).toHaveLength(1);
  });
  it("samples a dolly path without changing the stored camera", () => {
    const camera = defaultCamera(0);
    const points = createDirectorCameraPresetPositions("dolly-in", [0, 2.7, 9], [0, 0, 0]);
    const motion: DirectorCameraMotion = { id: "motion", cameraId: camera.id, camera, points, duration: 6, start: 2, preset: "dolly-in", label: "推进" };
    expect(sampleCameraMotion(motion, 0).position).toEqual(camera.position);
    expect(sampleCameraMotion(motion, 8).position.z).toBeCloseTo(points[1][2]);
    expect(camera.position.z).toBe(9);
    expect(sampleCameraMotion({ ...motion, preset: "dolly-zoom" }, 8).fov).toBeGreaterThan(camera.fov);
  });
});
