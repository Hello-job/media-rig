import { Button } from "./internal/components/ui/button";
import { Spinner } from "./internal/components/ui/spinner";
import { useI18n } from "./video-editor-context";

export function EditBusyOverlay({ onCancel }: { onCancel: () => void }) {
  const { t } = useI18n();
  return (
    <div
      className="absolute inset-0 z-[var(--ui-z-overlay-popover)] grid place-items-center bg-[var(--ui-bg-app)]/70 p-4"
      onKeyDown={(event) => event.stopPropagation()}
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-[var(--ui-radius-xl)] border border-[var(--ui-border-subtle)] bg-[var(--ui-bg-surface-raised)] p-6 shadow-[var(--ui-shadow-dialog)]">
        <div
          role="status"
          className="flex flex-col items-center gap-3 text-center"
        >
          <Spinner
            aria-hidden="true"
            aria-label={undefined}
            role="presentation"
            className="size-6 text-[color:var(--ui-text-secondary)] motion-reduce:animate-none"
          />
          <span>{t("videoEditor.loading")}</span>
        </div>
        <Button autoFocus variant="ghost" onClick={onCancel}>
          {t("videoEditor.cancel")}
        </Button>
      </div>
    </div>
  );
}
