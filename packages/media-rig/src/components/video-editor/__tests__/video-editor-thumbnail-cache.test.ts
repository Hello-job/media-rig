import { expect, it, vi } from "vitest";
import { createThumbnailCache } from "../thumbnail-cache";

it("shares concurrent and completed thumbnail requests within one session", async () => {
  const loader = vi.fn(async () => ["frame"]);
  const cache = createThumbnailCache(loader);
  const signal = new AbortController().signal;
  const [first, second] = await Promise.all([
    cache.load("video", signal),
    cache.load("video", signal),
  ]);
  expect(first).toBe(second);
  expect(await cache.load("video", signal)).toBe(first);
  expect(loader).toHaveBeenCalledTimes(1);
  cache.dispose();
});

it("cancels consumers independently and aborts decoding when nobody needs it", async () => {
  let finish!: (frames: string[]) => void;
  let requestSignal!: AbortSignal;
  const loader = vi.fn((_url: string, signal: AbortSignal) => {
    requestSignal = signal;
    return new Promise<string[]>((resolve) => {
      finish = resolve;
    });
  });
  const cache = createThumbnailCache(loader);
  const one = new AbortController();
  const two = new AbortController();
  const first = cache.load("video", one.signal);
  const second = cache.load("video", two.signal);
  const rejection = expect(first).rejects.toBeDefined();
  await Promise.resolve();
  one.abort();
  await rejection;
  expect(requestSignal.aborted).toBe(false);
  finish(["frame"]);
  expect(await second).toEqual(["frame"]);
  const third = new AbortController();
  const pending = cache.load("another", third.signal);
  const cancelled = expect(pending).rejects.toBeDefined();
  await Promise.resolve();
  third.abort();
  await cancelled;
  expect(requestSignal.aborted).toBe(true);
  finish([]);
  cache.dispose();
});

it("allows failed requests to retry and evicts least recently used completed entries", async () => {
  const loader = vi
    .fn(async (url: string) => [url])
    .mockRejectedValueOnce(new Error("offline"));
  const cache = createThumbnailCache(loader, 2);
  const signal = new AbortController().signal;
  await expect(cache.load("a", signal)).rejects.toThrow("offline");
  await cache.load("a", signal);
  await cache.load("b", signal);
  await cache.load("a", signal);
  await cache.load("c", signal);
  await cache.load("a", signal);
  expect(loader).toHaveBeenCalledTimes(4);
  await cache.load("b", signal);
  expect(loader).toHaveBeenCalledTimes(5);
  cache.dispose();
});

it("clears cached resources on disposal and supports effect setup again", async () => {
  const loader = vi.fn(async () => ["frame"]);
  const cache = createThumbnailCache(loader);
  const signal = new AbortController().signal;
  await cache.load("video", signal);
  cache.dispose();
  await cache.load("video", signal);
  expect(loader).toHaveBeenCalledTimes(2);
  cache.dispose();
});
