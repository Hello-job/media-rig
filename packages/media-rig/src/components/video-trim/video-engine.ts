import type { FFmpeg } from "@ffmpeg/ffmpeg";

// One isolated worker per operation; shared setup for trim and separation.
const CORE_BASE_URL =
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm";

export async function withVideoEngine<T>(
  src: string,
  signal: AbortSignal,
  run: (ffmpeg: FFmpeg, signal: AbortSignal) => Promise<T>,
): Promise<T> {
  signal.throwIfAborted();
  const [{ FFmpeg }, { fetchFile }] = await Promise.all([
    import("@ffmpeg/ffmpeg"),
    import("@ffmpeg/util"),
  ]);
  signal.throwIfAborted();
  const ffmpeg = new FFmpeg();
  const controller = new AbortController();
  const abort = () => {
    controller.abort();
    ffmpeg.terminate();
  };
  signal.addEventListener("abort", abort, { once: true });
  const loadingTimeout = setTimeout(abort, 120_000);
  const urls: string[] = [];
  const loadBlob = async (url: string) => {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok)
      throw new Error(`Video source fetch failed: ${response.status}`);
    const blob = await response.blob();
    controller.signal.throwIfAborted();
    return blob;
  };
  const coreAsset = async (name: string, type: string, base = CORE_BASE_URL) => {
    const blob = await loadBlob(`${base}/${name}`);
    controller.signal.throwIfAborted();
    const url = URL.createObjectURL(new Blob([blob], { type }));
    urls.push(url);
    return url;
  };
  try {
    const [coreURL, wasmURL] = await Promise.all([
      coreAsset("ffmpeg-core.js", "text/javascript"),
      coreAsset("ffmpeg-core.wasm", "application/wasm"),
    ]);
    try {
      await ffmpeg.load({ coreURL, wasmURL }, { signal: controller.signal });
    } catch {
      controller.signal.throwIfAborted();
      // Webpack emits a classic worker and rewrites the upstream dynamic import.
      // Retry with the classic core; Vite/module workers use the ESM core above.
      const classicURL = await coreAsset("ffmpeg-core.js", "text/javascript", CORE_BASE_URL.replace("/esm", "/umd"));
      await ffmpeg.load({ coreURL: classicURL, wasmURL }, { signal: controller.signal });
    }
    const source = await loadBlob(src);
    await ffmpeg.writeFile("input", await fetchFile(source), {
      signal: controller.signal,
    });
    clearTimeout(loadingTimeout);
    return await run(ffmpeg, controller.signal);
  } finally {
    clearTimeout(loadingTimeout);
    controller.abort();
    signal.removeEventListener("abort", abort);
    ffmpeg.terminate();
    urls.forEach((url) => URL.revokeObjectURL(url));
  }
}
