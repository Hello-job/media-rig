import type { VideoTrimRange } from "./trim-range";

import { withVideoEngine } from "./video-engine";

export async function trimVideo({
  src,
  range,
  signal,
  onProgress,
}: {
  src: string;
  range: VideoTrimRange;
  signal: AbortSignal;
  onProgress: (percent: number | null) => void;
}): Promise<Blob> {
  const [start, end] = range;
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start < 0 ||
    end <= start
  )
    throw new Error("Invalid video trim range");
  onProgress(null);
  return withVideoEngine(src, signal, async (ffmpeg, engineSignal) => {
    onProgress(0);
    ffmpeg.on("progress", ({ time }) => {
      if (!engineSignal.aborted)
        onProgress(
          Math.max(
            0,
            Math.min(99, Math.floor((time / 1_000_000 / (end - start)) * 100)),
          ),
        );
    });
    const exitCode = await ffmpeg.exec(
      [
        "-ss",
        start.toFixed(6),
        "-i",
        "input",
        "-t",
        (end - start).toFixed(6),
        "-map",
        "0:v:0",
        "-map",
        "0:a:0?",
        "-vf",
        "pad=ceil(iw/2)*2:ceil(ih/2)*2",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "18",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        "output.mp4",
      ],
      900_000,
      { signal: engineSignal },
    );
    if (exitCode !== 0) throw new Error("Video encoding failed");
    const data = await ffmpeg.readFile("output.mp4", "binary", {
      signal: engineSignal,
    });
    engineSignal.throwIfAborted();
    if (typeof data === "string" || data.byteLength === 0)
      throw new Error("Empty video output");
    onProgress(100);
    return new Blob([new Uint8Array(data)], { type: "video/mp4" });
  });
}
