import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { LightSphereProps, LightSpherePanelValue } from "./LightSphere.types";
import { DEFAULT_LIGHT_SPHERE_PANEL_VALUE, LIGHT_POSITION_PRESETS, SPHERE_RADIUS } from "./LightSphere.constants";
import { sphericalPoint } from "./utils/geometry";
import { resolveLightPositionPresetKey } from "./utils/position-preset";
import { getPhotoPlaneSize } from "./utils/photo-plane-size";
import { colorTemperatureToHex } from "./utils/color-temperature";

const scene = vi.hoisted(() => ({ props: {} as LightSphereProps }));
vi.mock("./LightSphere", () => ({ default: (props: LightSphereProps) => {
  scene.props = props;
  return <button type="button" aria-label="模拟灯位拖拽" onClick={() => props.onLightSettle?.({ x: 1.7, y: 1.7, z: 0.4 })}>拖拽</button>;
} }));
import LightSpherePanel from "./LightSpherePanel";

describe("LightSpherePanel", () => {
  it("matches tamen-web defaults and exposes all six directions", () => {
    render(<LightSpherePanel />);
    expect(screen.getByRole("slider", { name: "亮度" })).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByRole("slider", { name: "色温" })).toHaveAttribute("aria-valuenow", "5600");
    expect(screen.getByRole("button", { name: "透视" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "前方" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("switch", { name: "轮廓光" })).toHaveAttribute("aria-checked", "true");
    for (const { label } of LIGHT_POSITION_PRESETS) expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    expect(scene.props.targetPosition).toEqual({ x: 0, y: 0, z: 2.45 });
  });

  it("updates brightness and temperature with one commit per slider interaction", () => {
    const onChangeEnd = vi.fn();
    render(<LightSpherePanel onChangeEnd={onChangeEnd} />);
    const brightness = screen.getByRole("slider", { name: "亮度" });
    for (let i = 0; i < 3; i++) fireEvent.keyDown(brightness, { key: "PageUp" });
    expect(scene.props.intensity).toBe(0.8);
    fireEvent.pointerUp(brightness);
    fireEvent.blur(brightness);
    expect(onChangeEnd).toHaveBeenCalledTimes(1);
    const temperature = screen.getByRole("slider", { name: "色温" });
    fireEvent.keyDown(temperature, { key: "Home" });
    fireEvent.keyUp(temperature, { key: "Home" });
    fireEvent.blur(temperature);
    expect(scene.props.color).toBe(colorTemperatureToHex(2400));
    expect(onChangeEnd).toHaveBeenCalledTimes(2);
    expect(onChangeEnd).toHaveBeenLastCalledWith(expect.objectContaining({ intensity: 0.8, colorTemperature: 2400 }));
  });

  it("synchronizes preset buttons, settled drag position, and action payload", () => {
    const onAction = vi.fn();
    render(<LightSpherePanel onAction={onAction} actionInput={{ imageId: "example" }} />);
    fireEvent.click(screen.getByRole("button", { name: "后方" }));
    expect(scene.props.targetPosition?.z).toBeCloseTo(-SPHERE_RADIUS);
    expect(screen.getByRole("button", { name: "后方" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "模拟灯位拖拽" }));
    expect(screen.getByRole("button", { name: "后方" })).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("button", { name: "应用打光" }));
    expect(onAction.mock.calls[0][0]).toEqual({
      value: { ...DEFAULT_LIGHT_SPHERE_PANEL_VALUE, position: { x: 1.7, y: 1.7, z: 0.4 }, activePosition: null, rimLightEnabled: false },
      input: { imageId: "example" },
    });
  });

  it("resets controlled state, including camera, rim option, and position", () => {
    const onChangeEnd = vi.fn();
    function Controlled() {
      const [value, setValue] = useState<LightSpherePanelValue>({ ...DEFAULT_LIGHT_SPHERE_PANEL_VALUE, intensity: 1, colorTemperature: 10000, viewMode: "front", rimLightEnabled: false });
      return <LightSpherePanel value={value} onChange={setValue} onChangeEnd={onChangeEnd} />;
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole("button", { name: "重置打光" }));
    expect(onChangeEnd).toHaveBeenCalledExactlyOnceWith(DEFAULT_LIGHT_SPHERE_PANEL_VALUE);
    expect(scene.props.viewMode).toBe("perspective");
    expect(screen.getByRole("slider", { name: "亮度" })).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("supports close and prevents action while loading or disabled", () => {
    const onClose = vi.fn();
    const onAction = vi.fn();
    const { rerender } = render(<LightSpherePanel onClose={onClose} onAction={onAction} actionLoading />);
    fireEvent.click(screen.getByRole("button", { name: "关闭打光设置" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "处理中" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "处理中" }));
    expect(onAction).not.toHaveBeenCalled();
    rerender(<LightSpherePanel onAction={onAction} actionDisabled />);
    expect(screen.getByRole("button", { name: "应用打光" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "关闭打光设置" })).not.toBeInTheDocument();
  });

  it("does not re-submit an unchanged settled light position", () => {
    const onChange = vi.fn();
    render(<LightSpherePanel onChange={onChange} />);
    scene.props.onLightSettle?.({ ...DEFAULT_LIGHT_SPHERE_PANEL_VALUE.position });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("lighting preview geometry", () => {
  it("recognizes exactly the preset directions and leaves diagonal positions custom", () => {
    for (const preset of LIGHT_POSITION_PRESETS) {
      expect(resolveLightPositionPresetKey(sphericalPoint(preset.lat, preset.lon, SPHERE_RADIUS))).toBe(preset.key);
    }
    expect(resolveLightPositionPresetKey({ x: 1.7, y: 1.7, z: 0.4 })).toBeNull();
  });

  it("preserves portrait, landscape and square aspect ratios", () => {
    expect(getPhotoPlaneSize(200, 100)).toEqual({ width: 1.78, height: 0.89 });
    expect(getPhotoPlaneSize(100, 200)).toEqual({ width: 0.89, height: 1.78 });
    expect(getPhotoPlaneSize(200, 200)).toEqual({ width: 1.78, height: 1.78 });
    expect(getPhotoPlaneSize(0, 0)).toEqual({ width: 1.12, height: 1.78 });
  });
});
