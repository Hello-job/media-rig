import { Plus, Trash2, X } from "lucide-react";
import { Button } from "./internal/components/ui/button";
import { Textarea } from "./internal/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./internal/components/ui/tabs";
import { EditIconButton } from "./edit-icon-button";
import { EditNumberField } from "./edit-number-field";
import { TextStyleControls } from "./text-style-controls";
import { useI18n } from "./video-editor-context";
import {
  createSubtitle,
  isSubtitle,
  MAX_SUBTITLES,
  subtitleTrackId,
} from "./subtitles";
import { editDuration, formatTime, MIN_CLIP_DURATION } from "./timeline";
import type { useVideoEditor } from "./use-video-editor";

export function SubtitlePanel({
  session,
  onClose,
}: {
  session: ReturnType<typeof useVideoEditor>;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { doc, selected } = session;
  const allCues = doc.clips
    .filter(isSubtitle)
    .sort((a, b) => a.start - b.start);
  const active = allCues.find((cue) => cue.id === selected) ?? allCues[0];
  const cues = allCues.filter(
    (cue) => !active || subtitleTrackId(cue) === subtitleTrackId(active),
  );
  const duration = editDuration(doc);
  const disabled = Boolean(session.busy) || session.readOnly;
  const select = (id: string) => {
    session.setSelected(id);
    session.stop();
    const cue = cues.find((item) => item.id === id);
    if (cue) session.setTime(Math.min(cue.start, duration));
  };
  // Start after the current cue; stop at the next cue so adding a sentence doesn't overlap it.
  let start = Math.min(session.time, Math.max(0, duration - MIN_CLIP_DURATION));
  let end = duration;
  for (const cue of cues) {
    if (cue.start + cue.duration <= start) continue;
    if (cue.start - start >= MIN_CLIP_DURATION) {
      end = Math.min(end, cue.start);
      break;
    }
    start = Math.max(start, cue.start + cue.duration);
  }
  const canAdd =
    end - start >= MIN_CLIP_DURATION && allCues.length < MAX_SUBTITLES;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--ui-border-subtle)] px-4">
        <h2 className="font-medium">{t("videoEditor.subtitles")}</h2>
        <EditIconButton label="closeProperties" icon={X} onClick={onClose} />
      </header>
      <Tabs
        defaultValue="cues"
        variant="underline"
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList className="mx-4 shrink-0">
          <TabsTrigger value="cues">
            {t("videoEditor.subtitleList")}
          </TabsTrigger>
          <TabsTrigger value="style">
            {t("videoEditor.subtitleStyle")}
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="cues"
          className="mt-0 min-h-0 flex-1 overflow-auto p-3"
        >
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                disabled={disabled || !canAdd}
                className="min-w-0 flex-1 bg-[var(--ui-bg-control)]"
                onClick={() => {
                  const cue = createSubtitle(
                    crypto.randomUUID(),
                    t("videoEditor.defaultSubtitle"),
                    start,
                    Math.min(3, end - start),
                    active,
                  );
                  session.commit({ ...doc, clips: [...doc.clips, cue] });
                  session.setSelected(cue.id);
                  session.setTime(start);
                }}
              >
                <Plus className="size-4" />
                {t("videoEditor.addSubtitle")}
              </Button>
            </div>
            {!cues.length && (
              <p className="py-6 text-center text-[color:var(--ui-text-muted)]">
                {t("videoEditor.subtitleEmpty")}
              </p>
            )}
            {cues.map((cue, index) => (
              <div
                key={cue.id}
                className="flex flex-col gap-2 rounded-[var(--ui-radius-md)] border border-[var(--ui-border-subtle)] p-2"
                data-selected={selected === cue.id || undefined}
              >
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    className="min-w-0 flex-1 justify-start tabular-nums text-[color:var(--ui-text-secondary)]"
                    disabled={disabled}
                    aria-label={t("videoEditor.selectSubtitle", {
                      index: index + 1,
                    })}
                    onClick={() => select(cue.id)}
                  >
                    {index + 1} · {formatTime(cue.start)} —{" "}
                    {formatTime(cue.start + cue.duration)}
                  </Button>
                  <EditIconButton
                    label="deleteSubtitle"
                    icon={Trash2}
                    disabled={disabled}
                    onClick={() => {
                      session.commit({
                        ...doc,
                        clips: doc.clips.filter((clip) => clip.id !== cue.id),
                      });
                      if (selected === cue.id)
                        session.setSelected(
                          cues[index + 1]?.id ?? cues[index - 1]?.id ?? null,
                        );
                    }}
                  />
                </div>
                <Textarea
                  aria-label={t("videoEditor.subtitleContent", {
                    index: index + 1,
                  })}
                  rows={2}
                  maxLength={1000}
                  value={cue.text}
                  disabled={disabled}
                  className="min-h-16 resize-none border-0 bg-[var(--ui-bg-control)]"
                  onFocus={() => {
                    if (selected !== cue.id) select(cue.id);
                  }}
                  onChange={(event) =>
                    session.updateClip({ ...cue, text: event.target.value })
                  }
                />
                {selected === cue.id && (
                  <>
                    <EditNumberField
                      label="start"
                      value={cue.start}
                      min={0}
                      max={Math.max(
                        0,
                        cue.start + cue.duration - MIN_CLIP_DURATION,
                      )}
                      step={0.001}
                      unit="s"
                      disabled={disabled}
                      onChange={(next) =>
                        session.updateClip({
                          ...cue,
                          start: next,
                          duration: cue.start + cue.duration - next,
                        })
                      }
                    />
                    <EditNumberField
                      label="subtitleEnd"
                      value={cue.start + cue.duration}
                      min={cue.start + MIN_CLIP_DURATION}
                      max={Math.max(duration, cue.start + MIN_CLIP_DURATION)}
                      step={0.001}
                      unit="s"
                      disabled={disabled}
                      onChange={(next) =>
                        session.updateClip({
                          ...cue,
                          duration: next - cue.start,
                        })
                      }
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent
          value="style"
          className="mt-0 min-h-0 flex-1 overflow-auto p-4"
        >
          <div className="flex flex-col gap-4">
            {active ? (
              <TextStyleControls
                key={active.id}
                clip={active}
                disabled={disabled}
                onChange={session.updateClip}
              />
            ) : (
              <p className="py-6 text-center text-[color:var(--ui-text-muted)]">
                {t("videoEditor.subtitleEmpty")}
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
