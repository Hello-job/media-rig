import { AlignCenter, AlignLeft, AlignRight, Bold, Italic } from "lucide-react";
import { Input } from "./internal/components/ui/input";
import { useI18n } from "./video-editor-context";
import { EditNumberField } from "./edit-number-field";
import { EditIconButton } from "./edit-icon-button";
import type { TextClip } from "./types";

export function TextStyleControls({
  clip,
  disabled,
  onChange,
}: {
  clip: TextClip;
  disabled: boolean;
  onChange: (clip: TextClip) => void;
}) {
  const { t } = useI18n();
  return (
    <>
      <div className="flex items-center gap-2">
        <EditIconButton
          label="bold"
          icon={Bold}
          active={clip.bold !== false}
          disabled={disabled}
          onClick={() => onChange({ ...clip, bold: clip.bold === false })}
        />
        <EditIconButton
          label="italic"
          icon={Italic}
          active={clip.italic}
          disabled={disabled}
          onClick={() => onChange({ ...clip, italic: !clip.italic })}
        />
        {(["left", "center", "right"] as const).map((align, i) => (
          <EditIconButton
            key={align}
            label={`align${align}`}
            icon={[AlignLeft, AlignCenter, AlignRight][i]}
            active={(clip.align ?? "center") === align}
            disabled={disabled}
            onClick={() => onChange({ ...clip, align })}
          />
        ))}
      </div>
      <EditNumberField
        label="fontSize"
        value={clip.fontSize}
        min={12}
        max={200}
        step={1}
        disabled={disabled}
        onChange={(fontSize) => onChange({ ...clip, fontSize })}
      />
      <label className="flex h-11 shrink-0 items-center justify-between rounded-[var(--ui-radius-md)] bg-[var(--ui-bg-control)] px-3">
        <span className="text-[color:var(--ui-text-secondary)]">{t("videoEditor.color")}</span>
        <Input
          aria-label={t("videoEditor.color")}
          type="color"
          value={clip.color}
          disabled={disabled}
          className="h-7 w-12 border-0 bg-transparent p-0"
          onChange={(event) => onChange({ ...clip, color: event.target.value })}
        />
      </label>
      <details className="border-t border-[var(--ui-border-subtle)] pt-4">
        <summary className="cursor-pointer text-[color:var(--ui-text-secondary)]">
          {t("videoEditor.position")}
        </summary>
        <div className="mt-3 flex flex-col gap-3">
          <EditNumberField
            label="positionX"
            value={clip.x * 100}
            min={0}
            max={100}
            step={1}
            unit="%"
            disabled={disabled}
            onChange={(x) => onChange({ ...clip, x: x / 100 })}
          />
          <EditNumberField
            label="positionY"
            value={clip.y * 100}
            min={0}
            max={100}
            step={1}
            unit="%"
            disabled={disabled}
            onChange={(y) => onChange({ ...clip, y: y / 100 })}
          />
        </div>
      </details>
    </>
  );
}
