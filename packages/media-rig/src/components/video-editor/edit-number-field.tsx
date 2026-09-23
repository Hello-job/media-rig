import { useState } from "react";
import { Input } from "./internal/components/ui/input";
import { FluidSlider } from "./internal/components/ui/range-slider-fluid";
import { useI18n } from "./video-editor-context";

export function EditNumberField({
  label,
  value,
  min,
  max,
  sliderMax = max,
  step = 0.1,
  unit,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  sliderMax?: number;
  step?: number;
  unit?: string;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<{ base: number; text: string } | null>(
    null,
  );
  const activeDraft = draft?.base === value ? draft : null;
  const precision = Math.min(
    6,
    Math.max(2, String(step).split(".")[1]?.length ?? 0),
  );
  const text = activeDraft?.text ?? String(Number(value.toFixed(precision)));
  const parsed = Number(text);
  const current = text.trim() && Number.isFinite(parsed) ? parsed : value;
  const commit = (next: number) => {
    setDraft(null);
    if (disabled || !Number.isFinite(next)) return;
    const clean = Math.max(min, Math.min(max, next));
    if (clean !== value) onChange(clean);
  };
  const commitInput = () => {
    if (!activeDraft) return;
    if (text.trim()) commit(parsed);
    else setDraft(null);
  };
  return (
    <FluidSlider
      className="bg-[var(--ui-bg-control)] hover:bg-[var(--ui-bg-control-hover)]"
      label={t(`videoEditor.${label}`)}
      min={min}
      max={Math.min(max, Math.max(sliderMax, value))}
      step={step}
      value={current}
      disabled={disabled}
      format={(next) => `${Number(next.toFixed(precision))}${unit ?? ""}`}
      onValueChange={(next) => setDraft({ base: value, text: String(next) })}
      onValueCommit={commit}
      onValueCancel={() => setDraft(null)}
      renderValue={() => (
        <span className="flex items-center gap-1">
          <Input
            aria-label={t(`videoEditor.${label}`)}
            className="h-8 min-w-0 rounded-[var(--ui-radius-sm)] border-0 bg-transparent px-1 text-right tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            style={{ width: `${Math.max(3, text.length + 1)}ch` }}
            type="number"
            value={text}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={(e) => setDraft({ base: value, text: e.target.value })}
            onBlur={commitInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur();
              } else if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                setDraft(null);
              }
            }}
          />
          {unit && <span className="text-inherit">{unit}</span>}
        </span>
      )}
    />
  );
}
