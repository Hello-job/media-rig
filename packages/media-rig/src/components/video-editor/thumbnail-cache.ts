import type { VideoEditorServices } from "./types";

type Entry = {
  controller: AbortController;
  promise: Promise<string[]>;
  users: number;
  ready: boolean;
};

/** One editor session owns the cache; consumers can cancel independently. */
export function createThumbnailCache(
  loader: NonNullable<VideoEditorServices["loadThumbnails"]>,
  maxEntries = 32,
) {
  const entries = new Map<string, Entry>();
  const load = (url: string, signal: AbortSignal): Promise<string[]> => {
    if (signal.aborted) return Promise.reject(signal.reason);
    let entry = entries.get(url);
    if (!entry) {
      const controller = new AbortController();
      const created: Entry = {
        controller,
        users: 0,
        ready: false,
        promise: Promise.resolve().then(() => {
          controller.signal.throwIfAborted();
          return loader(url, controller.signal);
        }),
      };
      entry = created;
      entries.set(url, created);
      created.promise = created.promise.then(
        (frames) => {
          controller.signal.throwIfAborted();
          created.ready = true;
          return frames;
        },
        (error: unknown) => {
          if (entries.get(url) === created) entries.delete(url);
          throw error;
        },
      );
    }
    const current = entry;
    entries.delete(url);
    entries.set(url, current);
    current.users++;
    return new Promise((resolve, reject) => {
      let finished = false;
      const finish = (complete: () => void) => {
        if (finished) return;
        finished = true;
        signal.removeEventListener("abort", abort);
        current.users--;
        for (const [key, cached] of entries) {
          if (entries.size <= maxEntries) break;
          if (cached.ready && cached.users === 0) entries.delete(key);
        }
        complete();
        queueMicrotask(() => {
          if (current.users === 0 && !current.ready) {
            current.controller.abort();
            if (entries.get(url) === current) entries.delete(url);
          }
        });
      };
      const abort = () => finish(() => reject(signal.reason));
      signal.addEventListener("abort", abort, { once: true });
      current.promise.then(
        (frames) => finish(() => resolve(frames)),
        (error: unknown) => finish(() => reject(error)),
      );
    });
  };
  return {
    load,
    dispose() {
      entries.forEach((entry) => entry.controller.abort());
      entries.clear();
    },
  };
}
