import { X } from "lucide-react";
import { Textarea } from "./internal/components/ui/textarea";
import { useI18n } from "./video-editor-context";
import { clipDuration, MIN_CLIP_DURATION } from "./timeline";
import { EditNumberField } from "./edit-number-field";
import { EditIconButton } from "./edit-icon-button";
import { TextStyleControls } from "./text-style-controls";
import type { EditClip } from "./types";

export function ClipProperties({
  clip,
  timelineDuration,
  disabled,
  onChange,
  onClose,
}: {
  clip?: EditClip;
  timelineDuration: number;
  disabled: boolean;
  onChange: (clip: EditClip) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const number = (
    label: string,
    value: number,
    min: number,
    max: number,
    change: (n: number) => void,
    unit?: string,
    step = 0.1,
  ) => (
    <EditNumberField
      key={`${clip?.id}:${label}`}
      label={label}
      value={value}
      min={min}
      max={max}
      sliderMax={max === 36000 ? Math.max(10, timelineDuration, value) : max}
      disabled={disabled}
      onChange={change}
      unit={unit}
      step={step}
    />
  );
  if (!clip)
    return (
      <div className="grid h-full place-items-center text-[color:var(--ui-text-muted)]">
        {t("videoEditor.selectText")}
      </div>
    );
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--ui-border-subtle)] px-4">
        <h2 className="font-medium">{t(`videoEditor.${clip.kind}`)}</h2>
        <EditIconButton label="closeProperties" icon={X} onClick={onClose} />
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-5">
          {clip.kind === "text" ? (
            <>
              <Textarea
                aria-label={t("videoEditor.textContent")}
                value={clip.text}
                disabled={disabled}
                maxLength={1000}
                className="min-h-24 resize-none border-0 bg-[var(--ui-bg-control)]"
                onChange={(e) => onChange({ ...clip, text: e.target.value })}
              />
              <TextStyleControls
                clip={clip}
                disabled={disabled}
                onChange={onChange}
              />
              <div className="flex flex-col gap-3 border-t border-[var(--ui-border-subtle)] pt-5">
                {number(
                  "start",
                  clip.start,
                  0,
                  36000,
                  (start) => onChange({ ...clip, start }),
                  "s",
                )}
                {number(
                  "duration",
                  clip.duration,
                  MIN_CLIP_DURATION,
                  36000,
                  (duration) => onChange({ ...clip, duration }),
                  "s",
                )}
              </div>
            </>
          ) : (
            <>
              <section className="flex flex-col gap-3">
                <h3 className="mb-2 font-medium">
                  {t("videoEditor.speedSection")}
                </h3>
                {number(
                  "speed",
                  clip.speed,
                  0.25,
                  4,
                  (speed) => onChange({ ...clip, speed }),
                  "x",
                  0.25,
                )}
                {number(
                  "duration",
                  clipDuration(clip),
                  (clip.out - clip.in) / 4,
                  (clip.out - clip.in) / 0.25,
                  (duration) =>
                    onChange({
                      ...clip,
                      speed: (clip.out - clip.in) / duration,
                    }),
                  "s",
                )}
              </section>
              <section className="flex flex-col gap-3 border-t border-[var(--ui-border-subtle)] pt-5">
                <h3 className="mb-2 font-medium">
                  {t("videoEditor.volumeSection")}
                </h3>
                {number(
                  "gain",
                  clip.volume > 0 ? 20 * Math.log10(clip.volume) : -60,
                  -60,
                  0,
                  (db) =>
                    onChange({
                      ...clip,
                      volume: db <= -60 ? 0 : 10 ** (db / 20),
                    }),
                  "dB",
                )}
                {clip.kind === "audio" && (
                  <>
                    {number(
                      "fadeIn",
                      clip.fadeIn,
                      0,
                      clipDuration(clip),
                      (fadeIn) => onChange({ ...clip, fadeIn }),
                      "s",
                    )}
                    {number(
                      "fadeOut",
                      clip.fadeOut,
                      0,
                      clipDuration(clip),
                      (fadeOut) => onChange({ ...clip, fadeOut }),
                      "s",
                    )}
                  </>
                )}
              </section>
              <details className="border-t border-[var(--ui-border-subtle)] pt-4">
                <summary className="cursor-pointer text-[color:var(--ui-text-secondary)]">
                  {t("videoEditor.trimSection")}
                </summary>
                <div className="mt-3 flex flex-col gap-3">
                  {clip.kind === "audio" &&
                    number(
                      "start",
                      clip.start,
                      0,
                      36000,
                      (start) => onChange({ ...clip, start }),
                      "s",
                    )}
                  {number(
                    "trimIn",
                    clip.in,
                    0,
                    clip.out - MIN_CLIP_DURATION * clip.speed,
                    (value) => onChange({ ...clip, in: value }),
                    "s",
                  )}
                  {number(
                    "trimOut",
                    clip.out,
                    clip.in + MIN_CLIP_DURATION * clip.speed,
                    clip.source.duration,
                    (out) => onChange({ ...clip, out }),
                    "s",
                  )}
                </div>
              </details>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
