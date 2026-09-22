import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VideoTrim from "./VideoTrim";
import { trimVideo } from "./trim-video";

vi.mock("./trim-video", () => ({ trimVideo: vi.fn() }));
vi.mock("./thumbnail-strip", () => ({ createThumbnailStrip: vi.fn(async () => []) }));
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function load(container: HTMLElement, duration = 8) {
  const video = container.querySelector("video")!;
  Object.defineProperties(video, { duration: { configurable: true, value: duration }, videoWidth: { configurable: true, value: 641 }, videoHeight: { configurable: true, value: 359 } });
  fireEvent.loadedMetadata(video);
  return video;
}
describe("VideoTrim migration", () => {
  it("exports the selected range and MP4 metadata to the host", async () => {
    const blob = new Blob(["clip"], { type: "video/mp4" });
    vi.mocked(trimVideo).mockResolvedValue(blob);
    const onExport = vi.fn();
    const onRangeChange = vi.fn();
    const { container } = render(<VideoTrim src="/source.mp4" onExport={onExport} onRangeChange={onRangeChange} />);
    load(container);
    expect(onRangeChange).toHaveBeenLastCalledWith([0, 5]);
    fireEvent.keyDown(screen.getByRole("slider", { name: "截取起点" }), { key: "ArrowRight", shiftKey: true });
    fireEvent.keyDown(screen.getByRole("slider", { name: "截取终点" }), { key: "ArrowLeft", shiftKey: true });
    expect(onRangeChange).toHaveBeenLastCalledWith([1, 4]);
    fireEvent.click(screen.getByRole("button", { name: "生成片段" }));
    await waitFor(() => expect(onExport).toHaveBeenCalledWith(blob, { range: [1, 4], duration: 3, width: 642, height: 360 }));
  });
  it("aborts a pending export on source change and ignores stale output", async () => {
    let resolve!: (blob: Blob) => void;
    let signal!: AbortSignal;
    vi.mocked(trimVideo).mockImplementation(args => { signal = args.signal; return new Promise(done => { resolve = done; }); });
    const onExport = vi.fn();
    const { container, rerender } = render(<VideoTrim src="/first.mp4" onExport={onExport} />);
    load(container);
    fireEvent.click(screen.getByRole("button", { name: "生成片段" }));
    rerender(<VideoTrim src="/second.mp4" onExport={onExport} />);
    expect(signal.aborted).toBe(true);
    await act(async () => resolve(new Blob(["stale"])));
    expect(onExport).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "生成片段" })).toBeDisabled();
    load(container, 3);
    expect(screen.getByRole("slider", { name: "截取终点" })).toHaveAttribute("aria-valuenow", "3");
  });
  it("cancels an export and allows retry, with an accessible failure message", async () => {
    let signal!: AbortSignal;
    vi.mocked(trimVideo).mockImplementationOnce(args => { signal = args.signal; return new Promise(() => {}); }).mockRejectedValueOnce(new Error("encoding failed"));
    const onError = vi.fn();
    const { container } = render(<VideoTrim src="/source.mp4" onExport={vi.fn()} onError={onError} />);
    load(container);
    fireEvent.click(screen.getByRole("button", { name: "生成片段" }));
    fireEvent.click(screen.getByRole("button", { name: "取消生成" }));
    expect(signal.aborted).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "生成片段" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("截取失败");
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "encoding failed" }));
  });
  it("loops within the selection and stops looping when switched off", async () => {
    const { container } = render(<VideoTrim src="/source.mp4" onExport={vi.fn()} />);
    const video = load(container);
    fireEvent.keyDown(screen.getByRole("slider", { name: "截取终点" }), { key: "ArrowLeft", shiftKey: true });
    Object.defineProperty(video, "paused", { configurable: true, value: false });
    video.currentTime = 4.1;
    fireEvent.timeUpdate(video);
    expect(video.currentTime).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "关闭选区循环播放" }));
    video.currentTime = 4.1;
    fireEvent.timeUpdate(video);
    expect(video.currentTime).toBe(4.1);
  });
});
