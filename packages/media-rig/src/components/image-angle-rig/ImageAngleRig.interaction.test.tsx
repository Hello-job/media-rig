import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_IMAGE_ANGLE_STATE } from "./ImageAngleRig.constants";
import type { ImageAngleState } from "./ImageAngleRig.types";

import ImageAngleRig from "./ImageAngleRig";

function prepareSurface(container: HTMLElement, width = 300, height = 320) {
  const surface = container.querySelector<HTMLElement>('[data-slot="angle-drag-surface"]')!;
  surface.getBoundingClientRect = () => ({ width, height } as DOMRect);
  surface.setPointerCapture = vi.fn();
  surface.hasPointerCapture = vi.fn(() => true);
  surface.releasePointerCapture = vi.fn();
  return surface;
}

const pointer = (clientX: number, clientY: number, pointerId = 1) => ({
  pointerId, clientX, clientY, button: 0,
});

describe("ImageAngleRig interactions", () => {
  it("renders all six CSS faces and maps tilt, rotation and advance directly to CSS", () => {
    const { container, rerender } = render(<ImageAngleRig imageUrl="/example.png" value={{ yaw: 30, pitch: -20, zoom: 0 }} />);
    const cube = container.querySelector<HTMLElement>('[data-slot="angle-cube"]')!;
    expect(container.querySelector("canvas")).toBeNull();
    expect(cube.children).toHaveLength(6);
    expect(cube.style.transformStyle).toBe("preserve-3d");
    expect(cube.style.transform).toBe("rotateX(-20deg) rotateY(-30deg) scale3d(1, 1, 1)");
    expect(cube.querySelector("img")).toHaveAttribute("src", "/example.png");
    rerender(<ImageAngleRig value={{ yaw: -90, pitch: 45, zoom: 10 }} />);
    expect(cube.style.transform).toBe("rotateX(45deg) rotateY(90deg) scale3d(2, 2, 2)");
  });

  it("drags the empty preview on both axes without locking and commits once", () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const { container } = render(<ImageAngleRig defaultValue={{ yaw: 0, pitch: 0 }} onChange={onChange} onChangeEnd={onChangeEnd} />);
    const surface = prepareSurface(container);
    fireEvent.pointerDown(surface, pointer(0, 0));
    fireEvent.pointerMove(surface, pointer(2, 1));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.pointerMove(surface, pointer(30, 10));
    expect(onChange).toHaveBeenLastCalledWith({ yaw: -18, pitch: -3, zoom: 0, wideAngle: false });
    expect(screen.getByRole("slider", { name: "水平旋转" })).toHaveValue("-18");
    fireEvent.pointerMove(surface, pointer(150, 160));
    fireEvent.pointerUp(surface, pointer(150, 160));
    fireEvent.lostPointerCapture(surface, pointer(150, 160));
    expect(onChangeEnd).toHaveBeenCalledExactlyOnceWith({ yaw: -90, pitch: -45, zoom: 0, wideAngle: false });
    expect(surface.releasePointerCapture).toHaveBeenCalledWith(1);
  });

  it("keeps click, right click and other pointers from submitting or replacing a drag", () => {
    const onChangeEnd = vi.fn();
    const onChange = vi.fn();
    const { container } = render(<ImageAngleRig onChange={onChange} onChangeEnd={onChangeEnd} />);
    const surface = prepareSurface(container);
    fireEvent.pointerDown(surface, { ...pointer(0, 0), button: 2 });
    fireEvent.pointerMove(surface, pointer(50, 50));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.pointerDown(surface, pointer(0, 0));
    fireEvent.pointerDown(surface, pointer(0, 0, 2));
    fireEvent.pointerMove(surface, pointer(50, 50, 2));
    fireEvent.pointerUp(surface, pointer(50, 50, 2));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.pointerUp(surface, pointer(0, 0));
    expect(onChangeEnd).not.toHaveBeenCalled();
  });

  it.each(["pointerCancel", "lostPointerCapture"] as const)("finishes on %s and lets the next drag start", (event) => {
    const onChangeEnd = vi.fn();
    const { container } = render(<ImageAngleRig onChangeEnd={onChangeEnd} />);
    const surface = prepareSurface(container);
    fireEvent.pointerDown(surface, pointer(0, 0));
    fireEvent.pointerMove(surface, pointer(30, 0));
    fireEvent[event](surface, pointer(30, 0));
    expect(onChangeEnd).toHaveBeenCalledTimes(1);
    expect(surface).toHaveStyle({ cursor: "grab" });
    fireEvent.pointerDown(surface, pointer(0, 0, 2));
    fireEvent.pointerMove(surface, pointer(30, 0, 2));
    fireEvent.pointerUp(surface, pointer(30, 0, 2));
    expect(onChangeEnd).toHaveBeenLastCalledWith({ ...DEFAULT_IMAGE_ANGLE_STATE, yaw: -6 });
  });

  it("can return to the exact start after crossing the drag threshold", () => {
    const onChangeEnd = vi.fn();
    const { container } = render(<ImageAngleRig onChangeEnd={onChangeEnd} />);
    const surface = prepareSurface(container);
    fireEvent.pointerDown(surface, pointer(0, 0));
    fireEvent.pointerMove(surface, pointer(30, 20));
    fireEvent.pointerMove(surface, pointer(0, 0));
    fireEvent.pointerUp(surface, pointer(0, 0));
    expect(onChangeEnd).toHaveBeenCalledExactlyOnceWith(DEFAULT_IMAGE_ANGLE_STATE);
  });

  it("respects a custom threshold and its legacy alias", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<ImageAngleRig dragAxisLockThreshold={12} onChange={onChange} />);
    const surface = prepareSurface(container);
    fireEvent.pointerDown(surface, pointer(0, 0));
    fireEvent.pointerMove(surface, pointer(8, 0));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.pointerUp(surface, pointer(8, 0));
    rerender(<ImageAngleRig dragAxisLockThreshold={12} dragThreshold={3} onChange={onChange} />);
    fireEvent.pointerDown(surface, pointer(0, 0));
    fireEvent.pointerMove(surface, pointer(8, 0));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("submits changed sliders once on release, keyboard completion or blur", () => {
    const onChangeEnd = vi.fn();
    render(<ImageAngleRig onChangeEnd={onChangeEnd} />);
    const yaw = screen.getByRole("slider", { name: "水平旋转" });
    const pitch = screen.getByRole("slider", { name: "垂直倾斜" });
    const zoom = screen.getByRole("slider", { name: "镜头推进" });
    for (const slider of [yaw, pitch, zoom]) expect(slider).toHaveAttribute("step", "1");
    fireEvent.keyUp(yaw, { key: "Tab" });
    expect(onChangeEnd).not.toHaveBeenCalled();
    fireEvent.change(yaw, { target: { value: "42" } });
    fireEvent.pointerUp(yaw);
    fireEvent.blur(yaw);
    expect(onChangeEnd).toHaveBeenCalledTimes(1);
    fireEvent.change(pitch, { target: { value: "-19" } });
    fireEvent.keyUp(pitch, { key: "ArrowRight" });
    fireEvent.blur(pitch);
    expect(onChangeEnd).toHaveBeenCalledTimes(2);
    fireEvent.change(zoom, { target: { value: "10" } });
    fireEvent.blur(zoom);
    expect(onChangeEnd).toHaveBeenCalledTimes(3);
    expect(onChangeEnd).toHaveBeenLastCalledWith({ yaw: 42, pitch: -19, zoom: 10, wideAngle: false });
  });

  it("keeps controlled values in sync through toggling, applying and resetting", () => {
    const onAction = vi.fn();
    const onChangeEnd = vi.fn();
    function ControlledRig() {
      const [value, setValue] = useState<ImageAngleState>({ yaw: -10, pitch: 10, zoom: 4, wideAngle: false });
      return <ImageAngleRig value={value} onChange={setValue} onChangeEnd={onChangeEnd} onAction={onAction} />;
    }
    const { container } = render(<ControlledRig />);
    const cube = container.querySelector<HTMLElement>('[data-slot="angle-cube"]')!;
    const before = cube.style.transform;
    fireEvent.click(screen.getByRole("switch", { name: "广角镜头" }));
    expect(cube.style.transform).toBe(before);
    fireEvent.click(screen.getByRole("button", { name: "确认调整" }));
    expect(onAction.mock.calls[0][0].value).toEqual({ yaw: -10, pitch: 10, zoom: 4, wideAngle: true });
    fireEvent.click(screen.getByRole("button", { name: "重置角度" }));
    expect(onChangeEnd).toHaveBeenLastCalledWith(DEFAULT_IMAGE_ANGLE_STATE);
    expect(screen.getByRole("slider", { name: "水平旋转" })).toHaveValue("30");
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("exposes close and loading states and prevents repeated actions", () => {
    const onClose = vi.fn();
    const onAction = vi.fn();
    const { rerender } = render(<ImageAngleRig onClose={onClose} onAction={onAction} actionLoading />);
    const action = screen.getByRole("button", { name: "处理中" });
    expect(action).toBeDisabled();
    expect(action).toHaveAttribute("aria-busy", "true");
    fireEvent.click(action);
    expect(onAction).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "关闭多角度设置" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(<ImageAngleRig onAction={onAction} actionDisabled />);
    expect(screen.getByRole("button", { name: "确认调整" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "关闭多角度设置" })).not.toBeInTheDocument();
  });

  it("isolates preview and control interactions from the host canvas", () => {
    const onHostPointerDown = vi.fn();
    const onHostClick = vi.fn();
    const { container } = render(
      <div onPointerDown={onHostPointerDown} onClick={onHostClick}>
        <ImageAngleRig onClose={() => undefined} />
      </div>,
    );
    const surface = prepareSurface(container);
    fireEvent.pointerDown(surface, pointer(0, 0));
    fireEvent.pointerUp(surface, pointer(0, 0));
    for (const control of [
      screen.getByRole("slider", { name: "水平旋转" }),
      screen.getByRole("switch"),
      screen.getByRole("button", { name: "重置角度" }),
      screen.getByRole("button", { name: "关闭多角度设置" }),
      screen.getByRole("button", { name: "确认调整" }),
    ]) fireEvent.pointerDown(control, pointer(0, 0));
    expect(onHostPointerDown).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.click(screen.getByRole("button", { name: "重置角度" }));
    fireEvent.click(screen.getByRole("button", { name: "关闭多角度设置" }));
    fireEvent.click(screen.getByRole("button", { name: "确认调整" }));
    expect(onHostClick).not.toHaveBeenCalled();
  });

});
