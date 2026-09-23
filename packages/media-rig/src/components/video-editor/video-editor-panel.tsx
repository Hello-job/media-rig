import { useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "./internal/components/ui/button";
import { EditBusyOverlay } from "./edit-busy-overlay";
import { TooltipProvider } from "./internal/components/ui/tooltip";
import { useI18n } from "./video-editor-context";
import { ClipProperties } from "./clip-properties";
import { PreviewStage } from "./preview-stage";
import { EditTimeline } from "./edit-timeline";
import { editDuration, MIN_CLIP_DURATION } from "./timeline";
import {
  handleVideoEditorKeyDown,
  toggleVideoEditorPlayback,
} from "./video-editor-shortcuts";
import { EditTransport } from "./edit-transport";
import { EditSourceMenu } from "./edit-source-menu";
import { SubtitlePanel } from "./subtitle-panel";
import { createSubtitle, isSubtitle, MAX_SUBTITLES } from "./subtitles";
import { EditExportMenu } from "./edit-export-menu";
import { EditIconButton } from "./edit-icon-button";
import type { useVideoEditor } from "./use-video-editor";
import type { VideoEditorProps } from "./types";
import { cn } from "./internal/lib/utils";
import "./video-editor.css";

export function VideoEditorPanel({
  session,
  onClose,
  exportActions = [],
  recommendedResolution,
  className,
  onExportComplete,
}: {
  session: ReturnType<typeof useVideoEditor>;
  onClose?: () => void;
  exportActions?: VideoEditorProps["exportActions"];
  recommendedResolution?: VideoEditorProps["recommendedResolution"];
  className?: string;
  onExportComplete?: (destination: string) => void;
}) {
  const { t } = useI18n();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const { doc, time, playing, selected, busy } = session;
  const [zoom, setZoom] = useState(80);
  const [snapping, setSnapping] = useState(true);
  const [fitRevision, setFitRevision] = useState(0);
  const [timelineHeight, setTimelineHeight] = useState(32);
  const [subtitlesOpen, setSubtitlesOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const duration = editDuration(doc);
  const clip = doc.clips.find((c) => c.id === selected);
  const showSubtitles = subtitlesOpen || Boolean(clip && isSubtitle(clip));
  const disabled = Boolean(busy) || session.readOnly;
  const seek = (next: number) => {
    session.stop();
    session.setTime(next);
  };
  const togglePlay = () => toggleVideoEditorPlayback(session);
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stageRef.current?.requestFullscreen();
    } catch {
      session.previewError();
    }
  };
  const addText = () => {
    setSubtitlesOpen(false);
    const id = crypto.randomUUID();
    const start = Math.min(time, Math.max(0, duration - 0.1));
    session.commit({
      ...doc,
      clips: [
        ...doc.clips,
        {
          id,
          kind: "text",
          start,
          duration: Math.min(3, duration - start),
          text: t("videoEditor.defaultText"),
          fontSize: 48,
          color: "#ffffff",
          x: 0.5,
          y: 0.85,
        },
      ],
    });
    session.setSelected(id);
  };
  const addSubtitleTrack = () => {
    if (
      disabled ||
      !duration ||
      doc.clips.filter(isSubtitle).length >= MAX_SUBTITLES
    )
      return;
    const id = crypto.randomUUID();
    const start = Math.min(time, Math.max(0, duration - MIN_CLIP_DURATION));
    const cue = {
      ...createSubtitle(
        id,
        t("videoEditor.defaultSubtitle"),
        start,
        Math.min(3, duration - start),
      ),
      trackId: id,
    };
    session.commit({ ...doc, clips: [...doc.clips, cue] });
    session.setSelected(id);
    session.setTime(start);
    setSubtitlesOpen(true);
  };
  return (
    <TooltipProvider>
      <div
        ref={panelRef}
        role="region"
        tabIndex={-1}
        aria-label={t("videoEditor.editorTitle")}
        aria-describedby={descriptionId}
        className={cn(
          "video-editor relative isolate flex h-full min-h-0 w-full flex-col gap-0 overflow-hidden bg-[var(--ui-bg-app)] text-sm text-[color:var(--ui-text-primary)]",
          className,
        )}
        onPointerDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        onKeyDown={(event) => handleVideoEditorKeyDown(event, session)}
      >
        <header
          inert={busy === "import"}
          className="flex h-11 shrink-0 items-center justify-between px-2 pt-[env(safe-area-inset-top)]"
        >
          <h2 className="text-base font-semibold">
            {t("videoEditor.editorTitle")}
          </h2>
          <div className="flex items-center gap-2">
            <EditExportMenu
              recommendedResolution={recommendedResolution}
              loading={busy === "export"}
              actions={exportActions}
              disabled={
                disabled || !duration || session.missing || !session.canExport
              }
              onExport={(destination, settings) =>
                void session
                  .exportVideo(destination, settings)
                  .then((result) => {
                    if (result) onExportComplete?.(destination);
                  })
              }
            />
            {(onClose || busy === "export") && (
              <EditIconButton
                label={busy === "export" ? "cancelExport" : "close"}
                icon={X}
                disabled={busy === "import"}
                onClick={() => {
                  if (busy === "export") session.cancel();
                  else onClose?.();
                }}
              />
            )}
          </div>
        </header>
        <div className="contents" inert={Boolean(busy)}>
          <p id={descriptionId} className="sr-only">
            {t("videoEditor.description")}
          </p>
          {(session.error || session.missing || session.canRetryImport) && (
            <div
              role="alert"
              className="flex shrink-0 items-center justify-between gap-3 px-4 py-2 text-[color:var(--ui-warning)]"
            >
              <span>
                {session.error ??
                  t(
                    session.missing
                      ? "videoEditor.missing"
                      : "videoEditor.importIncomplete",
                  )}
              </span>
              {session.canRetryImport && (
                <Button
                  variant="ghost"
                  disabled={disabled}
                  onClick={() => void session.retryImport()}
                >
                  {t("videoEditor.retryImport")}
                </Button>
              )}
            </div>
          )}
          <div className="relative flex min-h-0 flex-1 gap-3 pb-2">
            {duration ? (
              <PreviewStage
                doc={doc}
                selected={selected}
                time={time}
                playing={playing && !session.missing && !disabled}
                disabled={disabled}
                stageRef={stageRef}
                onTime={session.setTime}
                onStop={session.stop}
                onError={session.previewError}
                onChange={session.updateClip}
              />
            ) : (
              <div className="flex min-w-0 flex-1 items-center justify-center">
                <EditSourceMenu session={session} kind="video" empty />
              </div>
            )}
            {(clip || showSubtitles) && (
              <aside className="absolute inset-y-0 right-0 z-10 w-64 overflow-hidden rounded-[var(--ui-radius-xl)] bg-[var(--ui-bg-surface-raised)] shadow-[var(--ui-shadow-popover)] md:static md:w-72 md:shrink-0 md:shadow-none xl:w-[20vw] xl:max-w-[420px]">
                {showSubtitles ? (
                  <SubtitlePanel
                    session={session}
                    onClose={() => {
                      setSubtitlesOpen(false);
                      session.setSelected(null);
                    }}
                  />
                ) : (
                  <ClipProperties
                    clip={clip}
                    timelineDuration={duration}
                    disabled={disabled}
                    onChange={session.updateClip}
                    onClose={() => session.setSelected(null)}
                  />
                )}
              </aside>
            )}
          </div>
          <div
            className="relative mx-1 mb-1 flex min-h-44 shrink-0 flex-col rounded-[var(--ui-radius-xl)] border border-[var(--ui-border-subtle)] bg-[var(--ui-bg-surface)]"
            style={{ flexBasis: `${timelineHeight}%` }}
          >
            <div
              role="separator"
              aria-label={t("videoEditor.resizeTimeline")}
              aria-orientation="horizontal"
              aria-valuenow={timelineHeight}
              tabIndex={0}
              className="absolute -top-2 left-1/3 z-10 h-4 w-1/3 touch-none cursor-ns-resize outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-accent)]"
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault();
                  setTimelineHeight((h) =>
                    Math.max(
                      24,
                      Math.min(65, h + (e.key === "ArrowUp" ? 2 : -2)),
                    ),
                  );
                }
              }}
              onPointerDown={(e) =>
                e.currentTarget.setPointerCapture(e.pointerId)
              }
              onPointerMove={(e) => {
                if (e.currentTarget.hasPointerCapture(e.pointerId))
                  setTimelineHeight(
                    Math.max(
                      24,
                      Math.min(
                        65,
                        (1 -
                          (e.clientY -
                            (panelRef.current?.getBoundingClientRect().top ??
                              0)) /
                            (panelRef.current?.clientHeight || 1)) *
                          100,
                      ),
                    ),
                  );
              }}
            />
            <EditTransport
              session={session}
              zoom={zoom}
              snapping={snapping}
              togglePlay={togglePlay}
              onAddText={addText}
              subtitlesOpen={showSubtitles}
              onSubtitles={addSubtitleTrack}
              onZoom={setZoom}
              onSnap={() => setSnapping((s) => !s)}
              onFit={() => setFitRevision((r) => r + 1)}
              onFullscreen={() => void fullscreen()}
            />
            <EditTimeline
              doc={doc}
              selected={selected}
              time={time}
              disabled={disabled}
              playing={playing}
              zoom={zoom}
              snapping={snapping}
              fitRevision={fitRevision}
              onZoom={setZoom}
              onSelect={(id) => {
                setSubtitlesOpen(
                  doc.clips.some((item) => item.id === id && isSubtitle(item)),
                );
                session.setSelected(id);
              }}
              onSeek={seek}
              onCommit={session.commit}
            />
          </div>
        </div>
        {busy === "import" && <EditBusyOverlay onCancel={session.cancel} />}
      </div>
    </TooltipProvider>
  );
}
