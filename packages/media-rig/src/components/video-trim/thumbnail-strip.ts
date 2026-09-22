function waitForMedia(
  video: HTMLVideoElement,
  event: string,
  signal: AbortSignal,
  action: () => void,
) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      video.removeEventListener(event, done);
      video.removeEventListener("error", fail);
      signal.removeEventListener("abort", fail);
    };
    const done = () => {
      cleanup();
      resolve();
    };
    const fail = () => {
      cleanup();
      reject(new Error("Video frame unavailable"));
    };
    const timer = setTimeout(fail, 15_000);
    video.addEventListener(event, done, { once: true });
    video.addEventListener("error", fail, { once: true });
    signal.addEventListener("abort", fail, { once: true });
    if (signal.aborted) {
      fail();
      return;
    }
    try {
      action();
    } catch {
      fail();
    }
  });
}

export async function createThumbnailStrip(
  src: string,
  signal: AbortSignal,
): Promise<string[]> {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.preload = "auto";
  const urls: string[] = [];
  try {
    await waitForMedia(video, "loadeddata", signal, () => {
      video.src = src;
      video.load();
    });
    if (!Number.isFinite(video.duration) || video.duration <= 0)
      throw new Error("Invalid duration");
    const canvas = document.createElement("canvas");
    canvas.width = 144;
    canvas.height = Math.max(
      1,
      Math.round((144 * video.videoHeight) / video.videoWidth),
    );
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas unavailable");
    for (let i = 0; i < 12; i++) {
      signal.throwIfAborted();
      const time = (video.duration * (i + 0.5)) / 12;
      await waitForMedia(video, "seeked", signal, () => {
        video.currentTime = time;
      });
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      urls.push(canvas.toDataURL("image/jpeg", 0.65));
    }
    return urls;
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
}
