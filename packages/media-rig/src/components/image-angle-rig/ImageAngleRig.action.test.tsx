import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ImageAngleActionButtonProps } from "./ImageAngleRig.types";

import ImageAngleRig from "./ImageAngleRig";

describe("ImageAngleRig action slot", () => {
  it("injects the current value, input, class, and click callback", () => {
    const input = { imageId: "image-01", label: "应用参数" };
    const onAction = vi.fn();

    function ActionButton({
      className,
      value,
      input: actionInput,
      onClick,
    }: ImageAngleActionButtonProps) {
      const label = typeof actionInput === "object" && actionInput && "label" in actionInput
        ? String(actionInput.label)
        : "应用参数";

      return (
        <button
          type="button"
          className={className}
          data-yaw={value.yaw}
          onClick={onClick}
        >
          {label}
        </button>
      );
    }

    const { container } = render(
      <ImageAngleRig
        defaultValue={{ yaw: 18, pitch: -12, zoom: 2 }}
        actionButton={ActionButton}
        actionInput={input}
        onAction={onAction}
      />,
    );

    const action = screen.getByRole("button", { name: "应用参数" });
    expect(action).toHaveClass("rounded-full");
    expect(action).toHaveAttribute("data-yaw", "18");
    expect(container.querySelector('[data-slot="action-slot"]')).toContainElement(action);

    fireEvent.click(action);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction.mock.calls[0][0]).toEqual({
      value: { yaw: 18, pitch: -12, zoom: 2, wideAngle: false },
      input,
    });
    expect(onAction.mock.calls[0][1].type).toBe("click");
  });

  it("keeps reset in the canvas lower-right overlay", () => {
    const { container } = render(<ImageAngleRig />);
    const reset = screen.getByRole("button", { name: "重置角度" });
    const canvasWrap = container.querySelector('[data-slot="canvas-wrap"]');

    expect(reset).toHaveClass("absolute", "bottom-3", "right-3");
    expect(canvasWrap).toContainElement(reset);
  });
});
