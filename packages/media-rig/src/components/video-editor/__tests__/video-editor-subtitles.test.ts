import { expect, it } from "vitest";
import { createSubtitle, updateEditClip } from "../subtitles";
import { timelineRows, splitClip } from "../timeline";
import { textOverlayFrames } from "../text-overlay-frames";
import type { TextClip, VideoEditDocument } from "../types";

const first = createSubtitle("s1", "First", 0.5, 1);
const second = createSubtitle("s2", "Second", 2, 1);
const title: TextClip = {
  ...first,
  textType: undefined,
  id: "title",
  text: "Title",
};
const doc: VideoEditDocument = { version: 1, clips: [title, first, second] };
it("keeps subtitles on one track after split and serialization without absorbing ordinary text", () => {
  const restored = JSON.parse(JSON.stringify(splitClip(doc, "s1", 1, "s3")));
  const rows = timelineRows(restored);
  expect(
    rows.find((row) => row.id === "subtitles")?.clips.map((clip) => clip.id),
  ).toEqual(["s1", "s3", "s2"]);
  expect(rows.find((row) => row.id === "title")?.clips).toEqual([title]);
});
it("applies style edits to all subtitles while preserving cue text, timing and ordinary text", () => {
  const next = updateEditClip(doc, {
    ...first,
    color: "#ff0000",
    fontSize: 64,
    y: 0.8,
  });
  expect(next.clips[0]).toBe(title);
  expect(next.clips[2]).toEqual({
    ...second,
    color: "#ff0000",
    fontSize: 64,
    y: 0.8,
  });
  expect(second.color).toBe("#ffffff");
  const edited = updateEditClip(doc, {
    ...first,
    text: "Edited",
    start: 0.1,
    duration: 0.9,
  });
  expect(edited.clips[2]).toBe(second);
});
it("generates text frames with exact gaps, end boundaries and stable overlay order", () => {
  const overlapping = { ...title, start: 1, duration: 1 };
  const frames = textOverlayFrames([overlapping, first, second], 4);
  expect(
    frames.map((frame) => [
      frame.time,
      frame.duration,
      frame.clips.map((clip) => clip.id),
    ]),
  ).toEqual([
    [0, 0.5, []],
    [0.5, 0.5, ["s1"]],
    [1, 0.5, ["title", "s1"]],
    [1.5, 0.5, ["title"]],
    [2, 1, ["s2"]],
    [3, 1, []],
    [4, 0, []],
  ]);
});

it("applies the subtitle limit to splitting and duplication while allowing ordinary text", async () => {
  const { duplicateClip } = await import("../timeline");
  const full: VideoEditDocument = {
    version: 1,
    clips: Array.from({ length: 500 }, (_, i) =>
      createSubtitle(`s${i}`, "Subtitle", i * 3, 3),
    ),
  };
  expect(splitClip(full, "s0", 1, "extra")).toBe(full);
  expect(duplicateClip(full, "s0", "extra")).toBe(full);
  const withTitle = { ...full, clips: [...full.clips, title] };
  expect(duplicateClip(withTitle, title.id, "copy").clips).toHaveLength(502);
});
