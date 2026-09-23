// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { EditTimeline } from "../edit-timeline";
import { VideoEditorContext, defaultTranslate } from "../video-editor-context";
import { TooltipProvider } from "../internal/components/ui/tooltip";
import { createSubtitle } from "../subtitles";
import type { VideoEditDocument } from "../types";
let root: Root;
let container: HTMLDivElement;
let nextFrame: FrameRequestCallback;
const loadThumbnails = vi.fn(async () => ["data:image/png;base64,AA=="]);
const doc: VideoEditDocument = {
  version: 1,
  clips: [
    {
      id: "video",
      kind: "video",
      start: 0,
      in: 0,
      out: 300,
      speed: 1,
      volume: 1,
      muted: false,
      fadeIn: 0,
      fadeOut: 0,
      source: {
        id: "source",
        url: "video.mp4",
        label: "Video",
        kind: "video",
        duration: 300,
        width: 1920,
        height: 1080,
      },
    },
    ...Array.from({ length: 500 }, (_, index) =>
      createSubtitle(`s${index}`, `Cue ${index}`, index * 0.6, 0.5),
    ),
  ],
};
beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    nextFrame = callback;
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  container = document.createElement("div");
  root = createRoot(container);
  await act(async () =>
    root.render(
      <VideoEditorContext.Provider
        value={{ t: defaultTranslate, services: { loadThumbnails } }}
      >
        <TooltipProvider>
          <EditTimeline
            doc={doc}
            selected={null}
            time={0}
            disabled={false}
            playing={false}
            zoom={320}
            snapping
            fitRevision={0}
            onZoom={vi.fn()}
            onSelect={vi.fn()}
            onSeek={vi.fn()}
            onCommit={vi.fn()}
          />
        </TooltipProvider>
      </VideoEditorContext.Provider>,
    ),
  );
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
it("renders only visible clips, thumbnails and ruler ticks, and updates them when scrolling", async () => {
  expect(container.querySelectorAll(".edit-clip").length).toBeLessThan(10);
  expect(container.querySelectorAll("img").length).toBeLessThan(15);
  expect(container.querySelector('[aria-label="Cue 0"]')).not.toBeNull();
  expect(container.querySelector('[aria-label="Cue 250"]')).toBeNull();
  const ruler = container.querySelector('[role="slider"]')!;
  expect(ruler.children.length).toBeLessThan(100);
  const scroller = container.querySelector("section")!;
  await act(async () => {
    scroller.scrollLeft = 150 * 320;
    scroller.dispatchEvent(new Event("scroll"));
  });
  await act(async () => nextFrame(16));
  expect(container.querySelector('[aria-label="Cue 0"]')).toBeNull();
  expect(container.querySelector('[aria-label="Cue 250"]')).not.toBeNull();
  expect(container.querySelectorAll("img").length).toBeLessThan(15);
  expect(loadThumbnails).toHaveBeenCalledTimes(1);
});
