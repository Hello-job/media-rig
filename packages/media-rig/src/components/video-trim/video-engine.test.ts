import { afterEach, describe, expect, it, vi } from "vitest";
import { withVideoEngine } from "./video-engine";

const engine = vi.hoisted(() => ({ load: vi.fn(), terminate: vi.fn(), writeFile: vi.fn() }));
vi.mock("@ffmpeg/ffmpeg", () => ({ FFmpeg: class { load = engine.load; terminate = engine.terminate; writeFile = engine.writeFile; } }));
vi.mock("@ffmpeg/util", () => ({ fetchFile: async () => new Uint8Array([1, 2, 3]) }));
afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals(); });
describe("video engine compatibility", () => {
  it("falls back to the classic core for Webpack and releases worker assets", async () => {
    engine.load.mockRejectedValueOnce(new Error("Cannot find module blob:core")).mockResolvedValueOnce(true);
    const fetcher = vi.fn(async (_url: string) => new Response(new Blob(["asset"])));
    vi.stubGlobal("fetch", fetcher);
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:asset"), revokeObjectURL });
    const run = vi.fn(async () => "encoded");
    expect(await withVideoEngine("/source.mp4", new AbortController().signal, run)).toBe("encoded");
    expect(fetcher.mock.calls.map(args => args[0])).toContain("https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js");
    expect(engine.load).toHaveBeenCalledTimes(2);
    expect(engine.writeFile).toHaveBeenCalledWith("input", new Uint8Array([1, 2, 3]), expect.any(Object));
    expect(engine.terminate).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledTimes(3);
  });
  it("does not fetch assets for an already cancelled task", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    const controller = new AbortController(); controller.abort();
    await expect(withVideoEngine("/source.mp4", controller.signal, vi.fn())).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
