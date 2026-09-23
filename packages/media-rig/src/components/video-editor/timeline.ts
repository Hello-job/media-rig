import type { EditClip, VideoEditDocument } from "./types";
import { isSubtitle, MAX_SUBTITLES, subtitleTrackId } from "./subtitles";
import { audioEnvelope } from "./audio-envelope";

export const EMPTY_EDIT: VideoEditDocument = { version: 1, clips: [] };
export const MIN_CLIP_DURATION = 0.1;
export function clipDuration(clip: EditClip) {
  return clip.kind === "text"
    ? clip.duration
    : (clip.out - clip.in) / clip.speed;
}
export function normalizeEdit(doc: VideoEditDocument): VideoEditDocument {
  let cursor = 0;
  const clips = doc.clips.map((clip) => {
    if (clip.kind !== "video") return clip;
    const next = { ...clip, start: cursor };
    cursor += clipDuration(clip);
    return next;
  });
  return { ...doc, clips };
}
export function editDuration(doc: VideoEditDocument) {
  // The main video track defines the output length. Audio/text are clipped at its end.
  return doc.clips
    .filter((c) => c.kind === "video")
    .reduce((sum, c) => sum + clipDuration(c), 0);
}
export function splitClip(
  doc: VideoEditDocument,
  id: string,
  time: number,
  newId: string,
) {
  const clip = doc.clips.find((c) => c.id === id);
  if (!clip) return doc;
  if (isSubtitle(clip) && doc.clips.filter(isSubtitle).length >= MAX_SUBTITLES)
    return doc;
  const offset = time - clip.start;
  const duration = clipDuration(clip);
  if (offset < MIN_CLIP_DURATION || duration - offset < MIN_CLIP_DURATION)
    return doc;
  let left: EditClip;
  let right: EditClip;
  if (clip.kind === "text") {
    left = { ...clip, trackId: trackId(clip), duration: offset };
    right = {
      ...clip,
      trackId: trackId(clip),
      id: newId,
      start: time,
      duration: duration - offset,
    };
  } else {
    const cut = clip.in + offset * clip.speed;
    const fadeRange = clip.fadeRange ?? {
      in: clip.in,
      out: clip.out,
      speed: clip.speed,
    };
    left = { ...clip, trackId: trackId(clip), out: cut, fadeRange };
    right = {
      ...clip,
      trackId: trackId(clip),
      id: newId,
      start: time,
      in: cut,
      fadeRange,
    };
  }
  return normalizeEdit({
    ...doc,
    clips: doc.clips.flatMap((c) => (c.id === id ? [left, right] : [c])),
  });
}
export function moveVideo(
  doc: VideoEditDocument,
  id: string,
  direction: -1 | 1,
) {
  const clips = [...doc.clips];
  const indexes = clips.flatMap((c, i) => (c.kind === "video" ? [i] : []));
  const from = indexes.findIndex((i) => clips[i].id === id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= indexes.length) return doc;
  [clips[indexes[from]], clips[indexes[to]]] = [
    clips[indexes[to]],
    clips[indexes[from]],
  ];
  return normalizeEdit({ ...doc, clips });
}
export function duplicateClip(
  doc: VideoEditDocument,
  id: string,
  newId: string,
) {
  const index = doc.clips.findIndex((clip) => clip.id === id);
  if (index < 0) return doc;
  const clip = doc.clips[index];
  if (isSubtitle(clip) && doc.clips.filter(isSubtitle).length >= MAX_SUBTITLES)
    return doc;
  const clips = [...doc.clips];
  clips.splice(index + 1, 0, {
    ...clip,
    id: newId,
    start: clip.start + clipDuration(clip),
  });
  return normalizeEdit({ ...doc, clips });
}
export function audioGain(
  clip: Exclude<EditClip, { kind: "text" }>,
  time: number,
) {
  if (clip.muted) return 0;
  const offset = time - clip.start;
  const remaining = clipDuration(clip) - offset;
  if (offset < 0 || remaining <= 0) return 0;
  const envelope = audioEnvelope(clip);
  const position = envelope.offset + offset * envelope.rate;
  const { fadeIn, fadeOut } = envelope;
  return (
    clip.volume *
    Math.max(0, Math.min(1, fadeIn > 0 ? position / fadeIn : 1)) *
    Math.max(
      0,
      Math.min(1, fadeOut > 0 ? (envelope.duration - position) / fadeOut : 1),
    )
  );
}
export function outputSize(
  width: number,
  height: number,
  resolution: 480 | 720 | 1080 = 1080,
) {
  const ratio = Math.min(1, (resolution * 16) / 9 / width, resolution / height);
  return {
    width: Math.max(2, Math.floor((width * ratio) / 2) * 2),
    height: Math.max(2, Math.floor((height * ratio) / 2) * 2),
  };
}
export function formatTime(time: number) {
  const value = Math.max(0, time);
  return `${Math.floor(value / 60)
    .toString()
    .padStart(2, "0")}:${(value % 60).toFixed(1).padStart(4, "0")}`;
}

export function trackId(clip: EditClip) {
  if (clip.kind === "video") return "video";
  if (clip.kind === "text" && clip.textType === "subtitle")
    return subtitleTrackId(clip);
  return clip.trackId ?? clip.id;
}
export function clipHidden(doc: VideoEditDocument, clip: EditClip) {
  return Boolean(doc.tracks?.[trackId(clip)]?.hidden);
}
export function clipMuted(doc: VideoEditDocument, clip: EditClip) {
  return Boolean(
    doc.tracks?.[trackId(clip)]?.muted ||
    (clip.kind !== "text" && clip.muted) ||
    (clip.kind === "audio" && clipHidden(doc, clip)),
  );
}
export function timelineRows(doc: VideoEditDocument) {
  const groups = new Map<string, EditClip[]>();
  groups.set("video", []);
  for (const clip of doc.clips) {
    const id = trackId(clip);
    const group = groups.get(id);
    if (group) group.push(clip);
    else groups.set(id, [clip]);
  }
  const rows = [...groups].map(([id, clips]) => ({
    id,
    clips,
    kind: clips[0]?.kind ?? "video",
  }));
  const rank = { text: 0, video: 1, audio: 2 };
  return rows.sort((a, b) => rank[a.kind] - rank[b.kind]);
}
export function trimClip(
  clip: EditClip,
  edge: "in" | "out",
  delta: number,
): EditClip {
  const duration = clipDuration(clip);
  if (edge === "in") {
    let amount = Math.min(duration - MIN_CLIP_DURATION, delta);
    if (clip.kind === "text") {
      amount = Math.max(-clip.start, amount);
      return {
        ...clip,
        start: clip.start + amount,
        duration: duration - amount,
      };
    }
    amount = Math.max(-clip.in / clip.speed, amount);
    if (clip.kind === "audio") amount = Math.max(-clip.start, amount);
    return {
      ...clip,
      in: clip.in + amount * clip.speed,
      start: clip.kind === "video" ? clip.start : clip.start + amount,
    };
  }
  if (clip.kind === "text")
    return { ...clip, duration: Math.max(MIN_CLIP_DURATION, duration + delta) };
  return {
    ...clip,
    out: Math.min(
      clip.source.duration,
      Math.max(
        clip.in + MIN_CLIP_DURATION * clip.speed,
        clip.out + delta * clip.speed,
      ),
    ),
  };
}
export function trimToPlayhead(
  doc: VideoEditDocument,
  id: string,
  time: number,
  edge: "in" | "out",
) {
  const clip = doc.clips.find((c) => c.id === id);
  if (!clip || time <= clip.start || time >= clip.start + clipDuration(clip))
    return doc;
  const delta =
    edge === "in" ? time - clip.start : time - clip.start - clipDuration(clip);
  return normalizeEdit({
    ...doc,
    clips: doc.clips.map((c) => (c.id === id ? trimClip(c, edge, delta) : c)),
  });
}
export function snapTime(value: number, points: number[], threshold: number) {
  let result = value;
  let distance = threshold;
  for (const point of points) {
    const next = Math.abs(value - point);
    if (next < distance) {
      distance = next;
      result = point;
    }
  }
  return Math.max(0, result);
}
export function formatClock(time: number) {
  const seconds = Math.max(0, Math.floor(time));
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
