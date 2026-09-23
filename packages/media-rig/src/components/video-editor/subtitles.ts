import type {
  EditClip,
  SubtitleClip,
  TextClip,
  VideoEditDocument,
} from "./types";

export const MAX_SUBTITLES = 500;
export function isSubtitle(clip: EditClip): clip is SubtitleClip {
  return clip.kind === "text" && clip.textType === "subtitle";
}

export function subtitleTrackId(clip: TextClip) {
  return clip.trackId ?? "subtitles";
}

export function subtitleStyle(clip?: TextClip) {
  return {
    fontSize: clip?.fontSize ?? 48,
    color: clip?.color ?? "#ffffff",
    x: clip?.x ?? 0.5,
    y: clip?.y ?? 0.9,
    bold: clip?.bold ?? true,
    italic: clip?.italic ?? false,
    align: clip?.align ?? "center",
  };
}

export function createSubtitle(
  id: string,
  text: string,
  start: number,
  duration: number,
  template?: TextClip,
): SubtitleClip {
  return {
    id,
    kind: "text",
    textType: "subtitle",
    text,
    start,
    duration,
    ...(template?.textType === "subtitle" && template.trackId
      ? { trackId: template.trackId }
      : {}),
    ...subtitleStyle(template),
  };
}

/** Style edits apply within a subtitle track; timing and text stay local to a cue. */
export function updateEditClip(
  doc: VideoEditDocument,
  next: EditClip,
): VideoEditDocument {
  const original = doc.clips.find((clip) => clip.id === next.id);
  if (!original) return doc;
  let style: Partial<ReturnType<typeof subtitleStyle>> = {};
  if (isSubtitle(original) && isSubtitle(next)) {
    const before = subtitleStyle(original);
    const after = subtitleStyle(next);
    style = Object.fromEntries(
      Object.entries(after).filter(
        ([key, value]) => before[key as keyof typeof before] !== value,
      ),
    );
  }
  return {
    ...doc,
    clips: doc.clips.map((clip) => {
      if (clip.id === next.id) return next;
      if (
        isSubtitle(clip) &&
        isSubtitle(original) &&
        subtitleTrackId(clip) === subtitleTrackId(original) &&
        Object.keys(style).length
      )
        return { ...clip, ...style };
      return clip;
    }),
  };
}
