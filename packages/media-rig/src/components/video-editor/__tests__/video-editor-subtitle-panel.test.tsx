// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SubtitlePanel } from "../subtitle-panel";
import { TooltipProvider } from "../internal/components/ui/tooltip";
import { useVideoEditor } from "../use-video-editor";
import { isSubtitle } from "../subtitles";
import type { MediaClip, VideoEditDocument } from "../types";

const video: MediaClip = {
  id: "v",
  kind: "video",
  start: 0,
  in: 0,
  out: 5,
  speed: 1,
  volume: 1,
  muted: false,
  fadeIn: 0,
  fadeOut: 0,
  source: {
    id: "source",
    url: "blob:video",
    label: "Video",
    kind: "video",
    duration: 5,
    width: 1920,
    height: 1080,
  },
};
let root: Root;
let container: HTMLDivElement;
let session: ReturnType<typeof useVideoEditor>;
function Harness() {
  const [doc, setDoc] = useState<VideoEditDocument>({
    version: 1,
    clips: [video],
  });
  session = useVideoEditor({
    value: doc,
    onChange: setDoc,
    sources: [video.source],
  });
  return (
    <TooltipProvider>
      <SubtitlePanel session={session} onClose={vi.fn()} />
    </TooltipProvider>
  );
}
beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<Harness />));
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
async function click(text: string) {
  const button = [...container.querySelectorAll("button")].find(
    (item) => item.textContent === text,
  )!;
  expect(button).toBeDefined();
  await act(async () => button.click());
}
it("adds a separate subtitle group, edits its shared style and supports undo", async () => {
  await click("Add sentence");
  await click("Add sentence");
  const cues = session.doc.clips.filter(isSubtitle);
  expect(cues).toHaveLength(2);
  expect(cues.map((cue) => [cue.start, cue.duration])).toEqual([
    [0, 3],
    [3, 2],
  ]);
  await act(async () => session.updateClip({ ...cues[0], color: "#ff0000" }));
  expect(
    session.doc.clips
      .filter(isSubtitle)
      .every((cue) => cue.color === "#ff0000"),
  ).toBe(true);
  await act(async () => session.undo());
  expect(
    session.doc.clips
      .filter(isSubtitle)
      .every((cue) => cue.color === "#ffffff"),
  ).toBe(true);
  const remove = container.querySelector<HTMLButtonElement>(
    '[aria-label="Delete subtitle"]',
  )!;
  await act(async () => remove.click());
  expect(session.doc.clips.filter(isSubtitle)).toHaveLength(1);
  await act(async () => session.undo());
  expect(session.doc.clips.filter(isSubtitle)).toHaveLength(2);
});

it("offers manual subtitle creation without a file upload", () => {
  expect(container.querySelector('input[type="file"]')).toBeNull();
  expect(container.textContent).not.toContain("SRT");
  expect(container.textContent).toContain("Add sentence");
});
