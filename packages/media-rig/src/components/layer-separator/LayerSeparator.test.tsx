import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LayerSeparator from "./LayerSeparator";

const result = {
  background: { id: "background", name: "Background", url: "/background.png" },
  layers: [{ id: "subject", name: "Subject", url: "/subject.png" }],
};

describe("LayerSeparator", () => {
  it("rotates and flips around the same off-center subject as its selection frame", () => {
    const { container } = render(<LayerSeparator imageUrl="/source.png" defaultResult={{
      ...result,
      layers: [{ ...result.layers[0], contentBounds: { x: 0.7, y: 0.5, width: 0.2, height: 0.4 } }],
    }} />);
    fireEvent.click(screen.getByRole("button", { name: "Rotate layer" }));
    fireEvent.click(screen.getByRole("button", { name: "Flip layer horizontally" }));
    const image = container.querySelector<HTMLElement>(".layer-separator__layer-image")!;
    expect(image.style.transform).toBe("rotate(90deg) scale(-1, 1)");
    expect(parseFloat(image.style.transformOrigin)).toBeCloseTo(80);
    expect(image.style.transformOrigin.split(" ")[1]).toBe("70%");
    expect(image.querySelector("img")!.style.transform).toBe("");
    expect(screen.getByRole("button", { name: "Subject" }).style.transform).toBe("rotate(90deg)");
    fireEvent.keyDown(screen.getByRole("slider"), { key: "Home" });
    for (let i = 0; i < 3; i++) fireEvent.keyDown(screen.getByRole("slider"), { key: "PageUp" });
    expect(parseFloat(image.style.left)).toBeCloseTo(40);
    expect(parseFloat(image.style.top)).toBeCloseTo(35);
  });

  it("sends normalized selections and the generated prompt to the host", async () => {
    const onSeparate = vi.fn().mockResolvedValue(result);
    render(
      <LayerSeparator
        imageUrl="/source.png"
        defaultSelections={[{ id: "subject", x1: 0.7, y1: 0.8, x2: 0.2, y2: 0.1 }]}
        onSeparate={onSeparate}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "分层说明" }), {
      target: { value: "保留人物和手提包" },
    });
    fireEvent.click(screen.getByRole("button", { name: /开始分层/ }));

    await waitFor(() => expect(onSeparate).toHaveBeenCalledTimes(1));
    expect(onSeparate.mock.calls[0][0]).toEqual({
      selections: [{ x1: 200, y1: 100, x2: 700, y2: 800 }],
      instruction: "保留人物和手提包",
      prompt: "保留人物和手提包\nSplit the objects within <bbox>200 100 700 800</bbox> into separate editable transparent layers, and keep the background as the base layer.",
    });
    expect(await screen.findByText("Subject")).toBeInTheDocument();
  });

  it("supports controlled results and emits layer visibility changes", () => {
    const onResultChange = vi.fn();
    render(
      <LayerSeparator
        imageUrl="/source.png"
        result={result}
        onResultChange={onResultChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Hide layer" }));
    expect(onResultChange).toHaveBeenCalledWith({
      ...result,
      layers: [{
        ...result.layers[0],
        transform: {
          x: 0,
          y: 0,
          width: 1,
          height: 1,
          rotation: 0,
          flipX: false,
          flipY: false,
          visible: false,
        },
      }],
    });
  });
});
