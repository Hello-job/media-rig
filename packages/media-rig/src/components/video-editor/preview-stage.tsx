import { useEffect, useRef, useState, type RefObject } from "react";
import { EditPreview } from "./edit-preview";
import { PreviewSelection } from "./preview-selection";
import { clipDuration, clipHidden, editDuration, outputSize } from "./timeline";
import type { EditClip, VideoEditDocument } from "./types";

export function PreviewStage({
  doc,
  selected,
  time,
  playing,
  disabled,
  stageRef,
  onTime,
  onStop,
  onError,
  onChange,
}: {
  doc: VideoEditDocument;
  selected: string | null;
  time: number;
  playing: boolean;
  disabled: boolean;
  stageRef: RefObject<HTMLDivElement | null>;
  onTime: (time: number) => void;
  onStop: () => void;
  onError: () => void;
  onChange: (clip: EditClip) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState({ width: 1, height: 1 });
  const [draft, setDraft] = useState<EditClip | null>(null);
  const first = doc.clips.find((c) => c.kind === "video");
  const source =
    first?.kind === "video"
      ? outputSize(first.source.width, first.source.height)
      : { width: 1920, height: 1080 };
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const measure = () =>
      setAvailable({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);
  const scale = Math.min(
    available.width / source.width,
    available.height / source.height,
  );
  const width = Math.max(1, source.width * scale);
  const height = Math.max(1, source.height * scale);
  const clip = doc.clips.find((c) => c.id === selected);
  const activeDraft = draft && clip?.id === draft.id ? draft : null;
  const previewDoc = activeDraft
    ? {
        ...doc,
        clips: doc.clips.map((c) =>
          c.id === activeDraft.id ? activeDraft : c,
        ),
      }
    : doc;
  const showBounds =
    clip &&
    !clipHidden(doc, clip) &&
    time >= clip.start &&
    Math.min(time, editDuration(doc) - 1 / 30) <
      clip.start + clipDuration(clip);
  return (
    <div
      ref={stageRef}
      className="edit-preview-stage flex h-full min-h-0 min-w-0 flex-1 items-center justify-center p-2"
    >
      <div
        ref={container}
        className="flex h-full w-full min-w-0 items-center justify-center"
      >
        <div className="relative shrink-0" style={{ width, height }}>
          <EditPreview
            doc={previewDoc}
            time={time}
            playing={playing}
            onTime={onTime}
            onStop={onStop}
            onError={onError}
          />
          {showBounds && (
            <PreviewSelection
              clip={activeDraft ?? clip}
              width={width}
              height={height}
              disabled={disabled}
              onDraft={setDraft}
              onCommit={onChange}
              onStop={onStop}
            />
          )}
        </div>
      </div>
    </div>
  );
}
