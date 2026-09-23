import type { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "./internal/components/ui/context-menu";
import { useI18n } from "./video-editor-context";
import {
  clipDuration,
  duplicateClip,
  moveVideo,
  normalizeEdit,
  splitClip,
} from "./timeline";
import type { EditClip, VideoEditDocument } from "./types";

export function ClipContextMenu({
  children,
  clip,
  doc,
  time,
  disabled,
  onCommit,
  onSelect,
}: {
  children: ReactNode;
  clip: EditClip;
  doc: VideoEditDocument;
  time: number;
  disabled: boolean;
  onCommit: (doc: VideoEditDocument) => void;
  onSelect: (id: string) => void;
}) {
  const { t } = useI18n();
  const update = (next: EditClip) =>
    onCommit({
      ...doc,
      clips: doc.clips.map((c) => (c.id === clip.id ? next : c)),
    });
  return (
    <ContextMenu>
      <ContextMenuTrigger
        asChild
        disabled={disabled}
        onContextMenu={() => onSelect(clip.id)}
      >
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="video-editor z-[var(--ui-z-overlay-popover)]">
        <ContextMenuItem
          disabled={
            time <= clip.start || time >= clip.start + clipDuration(clip)
          }
          onSelect={() =>
            onCommit(splitClip(doc, clip.id, time, crypto.randomUUID()))
          }
        >
          {t("videoEditor.split")}
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            const id = crypto.randomUUID();
            const next = duplicateClip(doc, clip.id, id);
            if (next === doc) return;
            onCommit(next);
            onSelect(id);
          }}
        >
          {t("videoEditor.duplicate")}
        </ContextMenuItem>
        {clip.kind !== "text" && (
          <ContextMenuItem
            onSelect={() => update({ ...clip, muted: !clip.muted })}
          >
            {t(clip.muted ? "videoEditor.unmute" : "videoEditor.mute")}
          </ContextMenuItem>
        )}
        {clip.kind === "video" && (
          <>
            <ContextMenuItem
              onSelect={() => onCommit(moveVideo(doc, clip.id, -1))}
            >
              {t("videoEditor.earlier")}
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => onCommit(moveVideo(doc, clip.id, 1))}
            >
              {t("videoEditor.later")}
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => update({ ...clip, transform: undefined })}
            >
              {t("videoEditor.resetTransform")}
            </ContextMenuItem>
          </>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem
          variant="destructive"
          onSelect={() =>
            onCommit(
              normalizeEdit({
                ...doc,
                clips: doc.clips.filter((c) => c.id !== clip.id),
              }),
            )
          }
        >
          {t("videoEditor.delete")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
