import type { EditSource } from "./types";
export function loadEditSource(
  source: Pick<EditSource, "id" | "url" | "label" | "kind">,
  signal: AbortSignal,
): Promise<EditSource> {
  return new Promise((resolve, reject) => {
    const media = document.createElement(
      source.kind === "video" ? "video" : "audio",
    );
    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      media.onloadedmetadata = null;
      media.onerror = null;
      media.removeAttribute("src");
      media.load();
    };
    const fail = (error: Error) => {
      cleanup();
      reject(error);
    };
    const abort = () => fail(new DOMException("Aborted", "AbortError"));
    const timer = setTimeout(
      () => fail(new Error("Media metadata timed out")),
      30000,
    );
    media.onloadedmetadata = () => {
      if (!Number.isFinite(media.duration) || media.duration <= 0)
        return fail(new Error("Invalid duration"));
      const result = {
        ...source,
        duration: media.duration,
        width: 1920,
        height: 1080,
      };
      if (media instanceof HTMLVideoElement) {
        result.width = media.videoWidth;
        result.height = media.videoHeight;
      }
      cleanup();
      resolve(result);
    };
    media.onerror = () => fail(new Error("Unable to read media"));
    signal.addEventListener("abort", abort, { once: true });
    if (signal.aborted) return abort();
    media.preload = "metadata";
    media.src = source.url;
  });
}
