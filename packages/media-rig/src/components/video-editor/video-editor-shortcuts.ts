import type { KeyboardEvent } from "react";
import { duplicateClip, editDuration, moveVideo, splitClip } from "./timeline";
import type { useVideoEditor } from "./use-video-editor";

type VideoEditorSession = ReturnType<typeof useVideoEditor>;

export function toggleVideoEditorPlayback(session: VideoEditorSession) {
  const duration = editDuration(session.doc);
  if (session.busy || session.readOnly || !duration || session.missing) return;
  if (session.time >= duration) session.setTime(0);
  session.setPlaying(!session.playing);
}

export function handleVideoEditorKeyDown(
  e: KeyboardEvent<HTMLElement>,
  session: VideoEditorSession,
) {
  const { doc, selected, time } = session;
  const disabled = Boolean(session.busy) || session.readOnly;
  const clip = doc.clips.find((item) => item.id === selected);

  e.stopPropagation();
  if (e.defaultPrevented || e.nativeEvent.isComposing) return;
  if (
    (e.target as HTMLElement).closest("input,textarea,[contenteditable=true]")
  )
    return;
  if (e.code === "Space") {
    e.preventDefault();
    toggleVideoEditorPlayback(session);
  }
  if (disabled) return;
  const command = e.ctrlKey || e.metaKey;
  if (command && e.key.toLowerCase() === "z") {
    e.preventDefault();
    if (e.shiftKey) session.redo();
    else session.undo();
  }
  if (selected && (e.key === "Delete" || e.key === "Backspace")) {
    e.preventDefault();
    e.currentTarget.focus({ preventScroll: true });
    session.commit({
      ...doc,
      clips: doc.clips.filter((c) => c.id !== selected),
    });
    session.setSelected(null);
  }
  if (selected && e.key.toLowerCase() === "s" && !command) {
    e.preventDefault();
    session.commit(splitClip(doc, selected, time, crypto.randomUUID()));
  }
  if (
    selected &&
    clip?.kind === "video" &&
    e.altKey &&
    ["ArrowLeft", "ArrowRight"].includes(e.key)
  ) {
    e.preventDefault();
    session.commit(moveVideo(doc, selected, e.key === "ArrowLeft" ? -1 : 1));
  }
  if (command && e.key.toLowerCase() === "d" && clip) {
    e.preventDefault();
    const id = crypto.randomUUID();
    const next = duplicateClip(doc, clip.id, id);
    if (next === doc) return;
    session.commit(next);
    session.setSelected(id);
  }
}
