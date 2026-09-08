import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ImageAnnotation from "./ImageAnnotation";
const { controller, compose } = vi.hoisted(() => ({
  controller: { tool: "brush", color: "#ff0000", strokeWidth: 3, ready: true, hasAnnotations: true, canUndo: true, canRedo: false, restoring: false, containerRef: { current: null }, canvasRef: { current: null }, setTool: vi.fn(), setColor: vi.fn(), setStrokeWidth: vi.fn(), undo: vi.fn(), redo: vi.fn(), deleteSelected: vi.fn(), reset: vi.fn(), isEditingText: vi.fn(() => false), exportOverlayCanvas: vi.fn(() => ({})) },
  compose: vi.fn(),
}));
vi.mock("./useAnnotationController", () => ({ useAnnotationController: () => controller }));
vi.mock("./compose", () => ({ composeImageWithAnnotation: compose }));
describe("ImageAnnotation save lifecycle", () => {
  beforeEach(() => { vi.clearAllMocks(); compose.mockResolvedValue(new Blob(["png"], { type: "image/png" })); });
  it("composes the source with the overlay and waits for the host save", async () => {
    let finish!: () => void;
    const onSave = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    render(<ImageAnnotation imageUrl="/scene.png" onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.any(Blob)));
    expect(compose).toHaveBeenCalledWith("/scene.png", expect.any(Object));
    expect(screen.getByRole("button", { name: "保存中…" })).toBeDisabled();
    finish();
    await waitFor(() => expect(screen.getByRole("button", { name: "保存" })).toBeEnabled());
  });
  it("reports export failure and allows retry", async () => {
    compose.mockRejectedValueOnce(new Error("图片加载失败"));
    const onError = vi.fn();
    render(<ImageAnnotation imageUrl="/scene.png" onSave={vi.fn()} onError={onError} />);
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("图片加载失败");
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    expect(screen.getByRole("button", { name: "保存" })).toBeEnabled();
  });
  it("uses the natural image ratio to align the annotation canvas", () => {
    render(<ImageAnnotation imageUrl="/portrait.png" aspectRatio={1.5} />);
    const image = screen.getByAltText("待涂鸦图片");
    Object.defineProperties(image, { naturalWidth: { value: 800 }, naturalHeight: { value: 1200 } });
    fireEvent.load(image);
    expect(parseFloat(image.parentElement?.style.aspectRatio ?? "")).toBeCloseTo(800 / 1200);
  });
});
