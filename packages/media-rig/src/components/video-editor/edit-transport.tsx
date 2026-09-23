import { ClipSplitIcon } from "./internal/components/icons/glyphs/clip-split-icon";
import { ClipTrimBeforeIcon } from "./internal/components/icons/glyphs/clip-trim-before-icon";
import { ClipTrimAfterIcon } from "./internal/components/icons/glyphs/clip-trim-after-icon";
import {
  Pause,
  Play,
  Redo2,
  Type,
  Captions,
  Undo2,
  Magnet,
  ZoomIn,
  ZoomOut,
  Shrink,
  Scan,
} from "lucide-react";
import { BubbleSlider } from "./internal/components/ui/range-slider-bubble";
import { Button } from "./internal/components/ui/button";
import { useI18n } from "./video-editor-context";
import {
  clipDuration,
  editDuration,
  formatClock,
  splitClip,
  trimToPlayhead,
} from "./timeline";
import { EditIconButton } from "./edit-icon-button";
import { isSubtitle, MAX_SUBTITLES } from "./subtitles";
import type { useVideoEditor } from "./use-video-editor";

export function EditTransport({
  session,
  zoom,
  snapping,
  togglePlay,
  onAddText,
  onSubtitles,
  subtitlesOpen,
  onZoom,
  onSnap,
  onFit,
  onFullscreen,
}: {
  session: ReturnType<typeof useVideoEditor>;
  zoom: number;
  snapping: boolean;
  togglePlay: () => void;
  onAddText: () => void;
  onSubtitles: () => void;
  subtitlesOpen: boolean;
  onZoom: (zoom: number) => void;
  onSnap: () => void;
  onFit: () => void;
  onFullscreen: () => void;
}) {
  const { t } = useI18n();
  const { doc, time, playing, selected, busy } = session;
  const duration = editDuration(doc);
  const clip = doc.clips.find((c) => c.id === selected);
  const disabled = Boolean(busy) || session.readOnly;
  const outside =
    !clip ||
    time - clip.start < 0.1 ||
    clip.start + clipDuration(clip) - time < 0.1;
  return (
    <div className="grid shrink-0 grid-cols-1 items-center gap-1 border-b border-[var(--ui-border-subtle)] px-3 py-2 md:grid-cols-[1fr_auto_1fr]">
      <div className="flex items-center gap-1 overflow-x-auto">
        <EditIconButton
          label="undo"
          icon={Undo2}
          disabled={disabled || !session.canUndo}
          onClick={session.undo}
        />
        <EditIconButton
          label="redo"
          icon={Redo2}
          disabled={disabled || !session.canRedo}
          onClick={session.redo}
        />
        <EditIconButton
          label="split"
          icon={ClipSplitIcon}
          disabled={disabled || outside}
          onClick={() =>
            selected &&
            session.commit(splitClip(doc, selected, time, crypto.randomUUID()))
          }
        />
        <EditIconButton
          label="trimBefore"
          icon={ClipTrimBeforeIcon}
          disabled={disabled || outside}
          onClick={() =>
            selected &&
            session.commit(trimToPlayhead(doc, selected, time, "in"))
          }
        />
        <EditIconButton
          label="trimAfter"
          icon={ClipTrimAfterIcon}
          disabled={disabled || outside}
          onClick={() =>
            selected &&
            session.commit(trimToPlayhead(doc, selected, time, "out"))
          }
        />
        <EditIconButton
          label="addText"
          icon={Type}
          active={clip?.kind === "text" && clip.textType !== "subtitle"}
          disabled={disabled || !duration}
          onClick={onAddText}
        />
        <EditIconButton
          label="subtitles"
          icon={Captions}
          active={subtitlesOpen}
          disabled={
            disabled ||
            !duration ||
            doc.clips.filter(isSubtitle).length >= MAX_SUBTITLES
          }
          onClick={onSubtitles}
        />
      </div>
      <div className="flex items-center justify-center gap-2 text-sm tabular-nums">
        <span>{formatClock(time)}</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t(playing ? "videoEditor.pause" : "videoEditor.play")}
          disabled={disabled || !duration || session.missing}
          onClick={togglePlay}
          className="size-8 rounded-full bg-[var(--ui-bg-control-active)] text-[color:var(--ui-text-primary)] hover:bg-[var(--ui-bg-control-hover)]"
        >
          {playing ? (
            <Pause className="size-4 fill-current" />
          ) : (
            <Play className="size-4 fill-current" />
          )}
        </Button>
        <span className="text-[color:var(--ui-text-muted)]">{formatClock(duration)}</span>
        <EditIconButton label="fullscreen" icon={Scan} onClick={onFullscreen} />
      </div>
      <div className="flex items-center justify-end gap-1">
        <EditIconButton
          label="snapping"
          icon={Magnet}
          active={snapping}
          onClick={onSnap}
        />
        <EditIconButton
          label="zoomOut"
          icon={ZoomOut}
          disabled={zoom <= 1}
          onClick={() => onZoom(Math.max(1, zoom / 1.4))}
        />
        <BubbleSlider
          aria-label={t("videoEditor.zoom")}
          size="sm"
          className="w-20"
          min={0}
          max={100}
          format={(value) =>
            `${Math.round((320 ** (value / 100) / 80) * 100)}%`
          }
          value={(Math.log(zoom) / Math.log(320)) * 100}
          onValueChange={(value) => onZoom(320 ** (value / 100))}
        />
        <EditIconButton
          label="zoomIn"
          icon={ZoomIn}
          disabled={zoom >= 320}
          onClick={() => onZoom(Math.min(320, zoom * 1.4))}
        />
        <EditIconButton label="fitTimeline" icon={Shrink} onClick={onFit} />
      </div>
    </div>
  );
}
