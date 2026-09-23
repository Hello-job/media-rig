import { describe, expect, it } from "vitest";
import {
  audioGain,
  trimClip,
  trimToPlayhead,
  timelineRows,
  clipHidden,
  clipMuted,
  snapTime,
  clipDuration,
  editDuration,
  moveVideo,
  normalizeEdit,
  outputSize,
  splitClip,
} from "../timeline";
import type {
  MediaClip,
  VideoEditDocument,
} from "../types";

const clip: MediaClip = {
  id: "v1",
  kind: "video",
  source: {
    id: "source",
    url: "https://example.test/a.mp4",
    kind: "video",
    label: "Video",
    duration: 12,
    width: 1920,
    height: 1080,
  },
  start: 0,
  in: 2,
  out: 10,
  speed: 2,
  volume: 0.8,
  muted: false,
  fadeIn: 1,
  fadeOut: 1,
};
const doc: VideoEditDocument = {
  version: 1,
  clips: [clip, { ...clip, id: "v2", start: 4, speed: 1 }],
};
describe("video edit timeline", () => {
  it("splits speed-adjusted source ranges without changing output duration", () => {
    const next = splitClip(doc, "v1", 1.5, "split");
    expect(next.clips[0]).toMatchObject({
      in: 2,
      out: 5,
      start: 0,
      fadeOut: 1,
      fadeRange: { in: 2, out: 10, speed: 2 },
    });
    expect(next.clips[1]).toMatchObject({
      in: 5,
      out: 10,
      start: 1.5,
      fadeIn: 1,
      fadeRange: { in: 2, out: 10, speed: 2 },
    });
    expect(next.clips[2].start).toBe(4);
    expect(editDuration(next)).toBe(editDuration(doc));
  });
  it("rejects splits outside the clip and at its boundaries", () => {
    expect(splitClip(doc, "v1", -1, "x")).toBe(doc);
    expect(splitClip(doc, "v1", 4, "x")).toBe(doc);
    expect(splitClip(doc, "v1", 0.01, "x")).toBe(doc);
  });
  it("reorders main video while preserving audio positions", () => {
    const audio = { ...clip, id: "a", kind: "audio" as const, start: 2 };
    const next = moveVideo({ ...doc, clips: [...doc.clips, audio] }, "v2", -1);
    expect(next.clips.map((c) => [c.id, c.start])).toEqual([
      ["v2", 0],
      ["v1", 8],
      ["a", 2],
    ]);
  });
  it("closes video gaps after trimming/deleting and keeps overlays independent", () => {
    expect(
      normalizeEdit({ ...doc, clips: [doc.clips[1]] }).clips[0].start,
    ).toBe(0);
    expect(clipDuration(clip)).toBe(4);
    expect(
      editDuration({
        ...doc,
        clips: [
          ...doc.clips,
          {
            id: "text",
            kind: "text",
            text: "字幕",
            start: 50,
            duration: 30,
            fontSize: 48,
            color: "#ffffff",
            x: 0.5,
            y: 0.8,
          },
        ],
      }),
    ).toBe(12);
  });
  it("applies fade envelopes and mute", () => {
    expect(audioGain(clip, 0.5)).toBeCloseTo(0.4);
    expect(audioGain(clip, 3.5)).toBeCloseTo(0.4);
    expect(audioGain({ ...clip, muted: true }, 2)).toBe(0);
    expect(audioGain(clip, 5)).toBe(0);
  });
  it("preserves source aspect, even dimensions and caps exports at 1080p", () => {
    expect(outputSize(3840, 2160)).toEqual({ width: 1920, height: 1080 });
    expect(outputSize(1080, 1920)).toEqual({ width: 606, height: 1080 });
    expect(outputSize(641, 361)).toEqual({ width: 640, height: 360 });
  });
});

describe("timeline gestures and track state", () => {
  it("converts trim gestures through speed, clamps source bounds and ripples video", () => {
    expect(trimClip(clip, "in", 1)).toMatchObject({ in: 4, start: 0 });
    expect(trimClip(clip, "out", 100)).toMatchObject({ out: 12 });
    expect(clipDuration(trimClip(clip, "in", 100))).toBeCloseTo(0.1);
    const next = trimToPlayhead(doc, "v1", 1.5, "out");
    expect(next.clips[0]).toMatchObject({ out: 5 });
    expect(next.clips[1].start).toBe(1.5);
  });
  it("trims audio while keeping its ending position and split segments in one row", () => {
    const audio = { ...clip, id: "audio", kind: "audio" as const, start: 3 };
    const trimmed = trimClip(audio, "in", 1);
    expect(trimmed.start + clipDuration(trimmed)).toBe(7);
    const next = splitClip({ version: 1, clips: [audio] }, "audio", 5, "a2");
    expect(
      timelineRows(next).find((r) => r.kind === "audio")?.clips,
    ).toHaveLength(2);
    const hidden = { ...next, tracks: { audio: { hidden: true } } };
    expect(
      hidden.clips.every((c) => clipHidden(hidden, c) && clipMuted(hidden, c)),
    ).toBe(true);
  });
  it("keeps hidden main-track sound independent of visibility and snaps to nearest edge", () => {
    const hidden = { ...doc, tracks: { video: { hidden: true } } };
    expect(clipHidden(hidden, clip)).toBe(true);
    expect(clipMuted(hidden, clip)).toBe(false);
    expect(snapTime(2.04, [0, 2, 2.1], 0.08)).toBe(2);
    expect(snapTime(2.5, [0, 2], 0.08)).toBe(2.5);
  });
});

it("preserves portrait proportions and avoids upscaling at a chosen resolution", () => {
  expect(outputSize(1080, 1920, 720)).toEqual({ width: 404, height: 720 });
  expect(outputSize(640, 360, 720)).toEqual({ width: 640, height: 360 });
});

it.each([
  { fadeIn: 4, fadeOut: 0, at: 2 },
  { fadeIn: 0, fadeOut: 4, at: 8 },
  { fadeIn: 8, fadeOut: 8, at: 5 },
])("preserves the audible envelope across a cut: %j", ({ at, ...fades }) => {
  const original: MediaClip = {
    ...clip,
    kind: "audio",
    in: 2,
    out: 12,
    start: 1,
    speed: 1,
    ...fades,
  };
  const split = splitClip(
    { version: 1, clips: [original] },
    original.id,
    at + 1,
    "right",
  );
  const restored: VideoEditDocument = JSON.parse(JSON.stringify(split));
  for (let time = 1; time < 11; time += 0.05) {
    const actual = restored.clips.reduce(
      (gain, item) => gain + (item.kind === "text" ? 0 : audioGain(item, time)),
      0,
    );
    expect(actual).toBeCloseTo(audioGain(original, time), 8);
  }
  const repeated = splitClip(restored, "right", at + 1.5, "third");
  for (let time = at + 1; time < 11; time += 0.05) {
    expect(
      repeated.clips.reduce(
        (gain, item) =>
          gain + (item.kind === "text" ? 0 : audioGain(item, time)),
        0,
      ),
    ).toBeCloseTo(audioGain(original, time), 8);
  }
});
