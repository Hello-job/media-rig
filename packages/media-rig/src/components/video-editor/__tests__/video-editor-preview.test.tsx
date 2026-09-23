// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditPreview } from "../edit-preview";
import { createSubtitle } from "../subtitles";
import type {
  MediaClip,
  VideoEditDocument,
} from "../types";

const clip: MediaClip = {
  id: "v1",
  kind: "video",
  source: {
    id: "source",
    url: "https://media.test/a.mp4",
    label: "Video",
    kind: "video",
    duration: 10,
    width: 1920,
    height: 1080,
  },
  start: 0,
  in: 0,
  out: 10,
  speed: 1,
  volume: 1,
  muted: false,
  fadeIn: 0,
  fadeOut: 0,
};
let root: Root;
let media: HTMLMediaElement[];
let nextFrame: FrameRequestCallback;
const reports = vi.fn();
const seeks = vi.fn();
const clearFrame = vi.fn();
const drawFrame = vi.fn();
const drawText = vi.fn();
async function render(doc: VideoEditDocument, playing = true, time = 0) {
  await act(async () =>
    root.render(
      <EditPreview
        doc={doc}
        playing={playing}
        time={time}
        onTime={reports}
        onStop={vi.fn()}
        onError={vi.fn()}
      />,
    ),
  );
}
async function tick(now: number) {
  await act(async () => nextFrame(now));
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  reports.mockClear();
  seeks.mockClear();
  clearFrame.mockClear();
  drawFrame.mockClear();
  drawText.mockClear();
  media = [];
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    nextFrame = callback;
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    fillRect: clearFrame,
    save: vi.fn(),
    restore: vi.fn(),
    fillText: drawText,
    strokeText: vi.fn(),
    drawImage: drawFrame,
  } as unknown as CanvasRenderingContext2D);
  const createElement = document.createElement.bind(document);
  vi.spyOn(document, "createElement").mockImplementation((tag, options) => {
    const element = createElement(tag, options);
    if (element instanceof HTMLMediaElement) {
      let currentTime = 0;
      let paused = true;
      Object.defineProperties(element, {
        readyState: { configurable: true, value: 4 },
        seeking: { configurable: true, value: false },
        ended: { value: false },
        currentTime: {
          get: () => currentTime,
          set: (value: number) => {
            seeks(value);
            currentTime = value;
          },
        },
        paused: { get: () => paused },
      });
      element.play = vi.fn(async () => {
        paused = false;
      });
      element.pause = vi.fn(() => {
        paused = true;
      });
      element.load = vi.fn();
      media.push(element);
    }
    return element;
  });
  root = createRoot(createElement("div"));
});

afterEach(async () => {
  await act(async () => root.unmount());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("native media preview clock", () => {
  it("shows subtitles only during their cue times and respects track visibility", async () => {
    const cue = createSubtitle("subtitle", "你好", 0.5, 0.5);
    const doc: VideoEditDocument = { version: 1, clips: [clip, cue] };
    await render(doc);
    await tick(0);
    expect(drawText).not.toHaveBeenCalled();
    media[0].currentTime = 0.5;
    await tick(500);
    expect(drawText.mock.calls.at(-1)?.[0]).toBe("你好");
    drawText.mockClear();
    media[0].currentTime = 1;
    await tick(1000);
    expect(drawText).not.toHaveBeenCalled();
    await render(
      { ...doc, tracks: { subtitles: { hidden: true } } },
      false,
      0.6,
    );
    await tick(1100);
    expect(drawText).not.toHaveBeenCalled();
  });
  it("follows decoded video time without repeated seeks and limits React updates", async () => {
    await render({ version: 1, clips: [clip] });
    await tick(0);
    for (let i = 1; i <= 60; i++) {
      media[0].currentTime = i / 60;
      seeks.mockClear();
      await tick((i * 1000) / 60);
      expect(seeks).not.toHaveBeenCalled();
    }
    expect(reports.mock.calls.length).toBeLessThanOrEqual(10);
    expect(reports.mock.calls.at(-1)?.[0]).toBeGreaterThan(0.8);
    expect(media[0].play).toHaveBeenCalledTimes(1);
    expect(media[0].pause).not.toHaveBeenCalled();
  });
  it("does not pause main video because an audio source is buffering", async () => {
    await render({
      version: 1,
      clips: [clip, { ...clip, id: "audio", kind: "audio" }],
    });
    Object.defineProperty(media[1], "readyState", { value: 1 });
    await tick(0);
    media[0].currentTime = 0.5;
    await tick(500);
    expect(media[0].play).toHaveBeenCalledTimes(1);
    expect(media[0].pause).not.toHaveBeenCalled();
    expect(reports).toHaveBeenLastCalledWith(0.5);
  });
  it("flushes precise pause time, and seeks only when the user scrubs", async () => {
    const doc = { version: 1 as const, clips: [clip] };
    await render(doc);
    await tick(0);
    media[0].currentTime = 0.12;
    await tick(120);
    media[0].currentTime = 0.18;
    await tick(180);
    await render(doc, false, 0.12);
    seeks.mockClear();
    await tick(190);
    expect(reports).toHaveBeenLastCalledWith(0.18);
    expect(seeks).not.toHaveBeenCalled();
    await render(doc, false, 4);
    await tick(200);
    expect(media[0].currentTime).toBe(4);
  });
  it("replays from the requested start after reaching the end", async () => {
    const doc = { version: 1 as const, clips: [clip] };
    await render(doc, false, 10);
    await tick(0);
    expect(media[0].currentTime).toBeGreaterThan(9);
    await render(doc, true, 0);
    await tick(20);
    expect(media[0].currentTime).toBe(0);
    expect(media[0].play).toHaveBeenCalledTimes(1);
  });
  it("switches clips at a trimmed boundary and uses speed-adjusted media time", async () => {
    await render({
      version: 1,
      clips: [
        { ...clip, in: 2, out: 4, speed: 2 },
        { ...clip, id: "v2", start: 1, in: 5, out: 8 },
      ],
    });
    await tick(0);
    expect(media[0].currentTime).toBe(2);
    media[0].currentTime = 4;
    await tick(1000);
    expect(media[1].currentTime).toBe(5);
    expect(media[1].play).toHaveBeenCalledTimes(1);
    media[1].currentTime = 5.5;
    await tick(1500);
    expect(reports).toHaveBeenLastCalledWith(1.5);
  });
});

describe("preview while dragging", () => {
  it("does not feed paused scrub positions back into the controlled playhead", async () => {
    const doc = { version: 1 as const, clips: [clip] };
    await render(doc, false);
    await tick(0);
    for (let index = 1; index <= 10; index++) {
      await render(doc, false, index / 10);
      await tick(index * 16);
    }
    expect(reports).not.toHaveBeenCalled();
    expect(media[0].currentTime).toBe(1);
    await render(doc, true, 1);
    await tick(200);
    media[0].currentTime = 1.04;
    await tick(216);
    await render(doc, false, reports.mock.calls.at(-1)?.[0] ?? 1);
    await tick(232);
    expect(reports).toHaveBeenLastCalledWith(1.04);
  });
  it("retains the decoded frame while scrubbing through an unready video", async () => {
    const doc = { version: 1 as const, clips: [clip] };
    await render(doc, false);
    await tick(0);
    clearFrame.mockClear();
    drawFrame.mockClear();
    Object.defineProperty(media[0], "readyState", { value: 1 });
    Object.defineProperty(media[0], "seeking", { value: true });
    await render(doc, false, 4);
    await tick(16);
    await render(doc, false, 6);
    await tick(32);
    expect(clearFrame).not.toHaveBeenCalled();
    expect(drawFrame).not.toHaveBeenCalled();
    Object.defineProperty(media[0], "readyState", { value: 4 });
    Object.defineProperty(media[0], "seeking", { value: false });
    media[0].dispatchEvent(new Event("seeked"));
    await tick(48);
    expect(media[0].currentTime).toBe(6);
    expect(drawFrame).toHaveBeenCalled();
  });
  it("does not clear a valid frame while dragging across a buffering clip boundary", async () => {
    const doc = {
      version: 1 as const,
      clips: [clip, { ...clip, id: "v2", start: 10 }],
    };
    await render(doc, false, 2);
    await tick(0);
    clearFrame.mockClear();
    Object.defineProperty(media[1], "readyState", { value: 1 });
    await render(doc, false, 12);
    await tick(16);
    expect(clearFrame).not.toHaveBeenCalled();
    Object.defineProperty(media[1], "readyState", { value: 4 });
    media[1].dispatchEvent(new Event("loadeddata"));
    await tick(32);
    expect(drawFrame).toHaveBeenLastCalledWith(media[1], 0, 0, 1920, 1080);
  });
  it("reuses decoded media elements when clips are reordered", async () => {
    const second = { ...clip, id: "v2", start: 10 };
    await render({ version: 1, clips: [clip, second] }, false);
    await tick(0);
    const originals = [...media];
    await render(
      {
        version: 1,
        clips: [
          { ...second, start: 0 },
          { ...clip, start: 10 },
        ],
      },
      false,
    );
    await tick(16);
    expect(media).toHaveLength(2);
    expect(originals[0].load).not.toHaveBeenCalled();
    expect(drawFrame).toHaveBeenLastCalledWith(originals[1], 0, 0, 1920, 1080);
  });
});
