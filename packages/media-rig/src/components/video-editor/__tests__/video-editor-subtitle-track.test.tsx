// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { VideoEditorPanel } from "../video-editor-panel";
import { useVideoEditor } from "../use-video-editor";
import { isSubtitle } from "../subtitles";
import { clipHidden, splitClip, timelineRows } from "../timeline";
import type { VideoEditDocument } from "../types";

vi.mock("../preview-stage", () => ({ PreviewStage: () => null }));
vi.mock("../video-clip-strip", () => ({ VideoClipStrip: () => null }));
let root: Root;
let container: HTMLDivElement;
let session: ReturnType<typeof useVideoEditor>;
function Harness({ readOnly = false }: { readOnly?: boolean }) {
  const [doc, setDoc] = useState<VideoEditDocument>({
    version: 1,
    clips: [
      {
        id: "video",
        kind: "video",
        start: 0,
        in: 0,
        out: 8,
        speed: 1,
        volume: 1,
        muted: false,
        fadeIn: 0,
        fadeOut: 0,
        source: {
          id: "source",
          url: "blob:test",
          label: "Video",
          kind: "video",
          duration: 8,
          width: 1920,
          height: 1080,
        },
      },
    ],
  });
  session = useVideoEditor({
    value: doc,
    onChange: setDoc,
    sources: [],
    readOnly,
  });
  return <VideoEditorPanel session={session} />;
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
async function click(label: string) {
  const button = [
    ...container.querySelectorAll<HTMLButtonElement>("button"),
  ].find(
    (item) =>
      item.getAttribute("aria-label") === label || item.textContent === label,
  );
  expect(button).toBeDefined();
  await act(async () => button!.click());
}

it("creates and selects a new subtitle row on each toolbar click, with undo and redo", async () => {
  await act(async () => {
    session.setTime(2);
    session.setPlaying(true);
  });
  await click("Subtitles");
  const first = session.doc.clips.filter(isSubtitle)[0];
  expect(first).toMatchObject({ start: 2, duration: 3, trackId: first.id });
  expect(session.selected).toBe(first.id);
  expect(session.playing).toBe(false);
  expect(
    container.querySelector('textarea[aria-label="Subtitle 1 content"]'),
  ).not.toBeNull();
  await click("Subtitles");
  const second = session.doc.clips.filter(isSubtitle)[1];
  expect(second.trackId).not.toBe(first.trackId);
  expect(
    timelineRows(session.doc).filter((row) => row.clips.some(isSubtitle)),
  ).toHaveLength(2);
  expect(session.selected).toBe(second.id);
  await click("Undo");
  expect(session.doc.clips.filter(isSubtitle)).toEqual([first]);
  await click("Redo");
  expect(session.doc.clips.filter(isSubtitle)).toHaveLength(2);
});

it("appends sentences to the selected track, keeping its style and visibility isolated", async () => {
  await click("Subtitles");
  await click("Subtitles");
  const [first, second] = session.doc.clips.filter(isSubtitle);
  await click("Add sentence");
  const third = session.doc.clips.filter(isSubtitle)[2];
  expect(third).toMatchObject({ trackId: second.trackId, start: 3 });
  await act(async () => session.updateClip({ ...third, color: "#ff0000" }));
  expect(session.doc.clips.find((clip) => clip.id === first.id)).toEqual(first);
  expect(
    session.doc.clips
      .filter(isSubtitle)
      .slice(1)
      .every((clip) => clip.color === "#ff0000"),
  ).toBe(true);
  await act(async () =>
    session.commit(splitClip(session.doc, second.id, 1, "split")),
  );
  expect(
    timelineRows(session.doc).find((row) => row.id === second.trackId)?.clips,
  ).toHaveLength(3);
  await act(async () =>
    session.commit({
      ...session.doc,
      tracks: { [second.trackId!]: { hidden: true } },
    }),
  );
  expect(clipHidden(session.doc, first)).toBe(false);
  expect(clipHidden(session.doc, third)).toBe(true);
});

it("clamps new cues at the end and disables creation in read-only mode", async () => {
  await act(async () => session.setTime(8));
  await click("Subtitles");
  const cue = session.doc.clips.filter(isSubtitle)[0];
  expect(cue.start).toBeCloseTo(7.9);
  expect(cue.duration).toBeCloseTo(0.1);
  expect(session.time).toBeCloseTo(7.9);
  await act(async () => root.render(<Harness readOnly />));
  await click("Subtitles");
  expect(session.doc.clips.filter(isSubtitle)).toHaveLength(1);
});
