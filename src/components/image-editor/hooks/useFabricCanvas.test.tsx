import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useFabricCanvas } from "./useFabricCanvas";

const { instances } = vi.hoisted(() => ({ instances: [] as Array<Record<string, any>> }));

vi.mock("fabric", () => {
  class MockCanvas {
    dispose = vi.fn().mockResolvedValue(undefined);
    setDimensions = vi.fn();
    requestRenderAll = vi.fn();
    constructor() {
      instances.push(this);
    }
  }
  return {
    Canvas: MockCanvas,
    FabricObject: { ownDefaults: { transparentCorners: true } },
  };
});

function Harness() {
  const editor = useFabricCanvas({ width: 1024, height: 768 });
  return (
    <div ref={editor.viewportRef}>
      <canvas ref={editor.canvasElementRef} />
      <output>{editor.canvas ? "ready" : "loading"}</output>
    </div>
  );
}

describe("useFabricCanvas", () => {
  it("creates one Fabric canvas and disposes it on unmount", async () => {
    const view = render(<Harness />);
    await waitFor(() => expect(instances).toHaveLength(1));
    expect(instances[0].setDimensions).toHaveBeenCalledWith({ width: 1024, height: 768 });
    view.unmount();
    expect(instances[0].dispose).toHaveBeenCalledOnce();
  });
});
