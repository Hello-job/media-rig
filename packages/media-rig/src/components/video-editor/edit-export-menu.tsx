import { useRef, useState } from "react";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react";
import { ChevronDown } from "lucide-react";
import { Button } from "./internal/components/ui/button";
import { Spinner } from "./internal/components/ui/spinner";
import { Dialog, DialogContent, DialogTitle } from "./internal/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./internal/components/ui/select";
import { useI18n } from "./video-editor-context";
import type { VideoEditorExportSettings } from "./types";

export function EditExportMenu({
  disabled,
  loading = false,
  actions,
  recommendedResolution,
  onExport,
}: {
  disabled: boolean;
  loading?: boolean;
  actions: { id: string; label: string }[];
  recommendedResolution?: VideoEditorExportSettings["resolution"];
  onExport: (destination: string, settings: VideoEditorExportSettings) => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState(actions[0]?.id ?? "");
  const [chosenResolution, setResolution] =
    useState<VideoEditorExportSettings["resolution"]>();
  const resolution = chosenResolution ?? recommendedResolution ?? 1080;
  const [format, setFormat] =
    useState<VideoEditorExportSettings["format"]>("mp4");
  const trigger = useRef<HTMLButtonElement>(null);
  const { refs, floatingStyles } = useFloating({
    open,
    placement: "bottom-end",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 12 })],
  });
  if (!actions.length) return null;
  const selectedDestination = actions.some(
    (action) => action.id === destination,
  )
    ? destination
    : actions[0].id;
  const field = (
    label: string,
    value: string,
    options: { value: string; label: string }[],
    onValueChange: (value: string) => void,
  ) => (
    <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-4">
      <span className="text-[color:var(--ui-text-secondary)]">
        {t(`videoEditor.${label}`)}
      </span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          aria-label={t(`videoEditor.${label}`)}
          className="h-10 rounded-[var(--ui-radius-lg)] border-0 bg-[var(--ui-bg-control)] text-sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="video-editor">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-sm"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
  return (
    <Dialog open={open && !disabled && !loading} onOpenChange={setOpen}>
      <Button
        ref={(element) => {
          trigger.current = element;
          refs.setReference(element);
        }}
        variant="outline"
        disabled={disabled || loading}
        aria-haspopup="dialog"
        aria-expanded={open && !disabled && !loading}
        aria-busy={loading || undefined}
        aria-label={t(
          loading ? "videoEditor.exportingButton" : "videoEditor.exportMenu",
        )}
        onClick={() => setOpen(true)}
        className="h-9 gap-2 border-0 bg-[var(--ui-text-primary)] px-4 text-[color:var(--ui-bg-app)] hover:bg-[var(--ui-text-primary)]/90 hover:text-[color:var(--ui-bg-app)] active:bg-[var(--ui-text-primary)]/80"
      >
        {loading ? (
          <>
            <Spinner
              aria-hidden="true"
              aria-label={undefined}
              role="presentation"
              className="size-4 motion-reduce:animate-none"
            />
            <span role="status">{t("videoEditor.exportingButton")}</span>
          </>
        ) : (
          <>
            {t("videoEditor.exportMenu")}
            <ChevronDown className="size-3" />
          </>
        )}
      </Button>
      <DialogContent
        ref={refs.setFloating}
        style={floatingStyles}
        showCloseButton={false}
        showOverlay={false}
        aria-describedby={undefined}
        onKeyDown={(event) => event.stopPropagation()}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          trigger.current?.focus({ preventScroll: true });
        }}
        className="video-editor left-0 top-0 flex w-[360px] max-w-[calc(100vw-2rem)] translate-x-0 translate-y-0 flex-col gap-5 rounded-[var(--ui-radius-xl)] border-0 bg-[var(--ui-bg-surface)] p-4 text-sm"
      >
        <DialogTitle className="font-medium text-[color:var(--ui-text-muted)]">
          {t("videoEditor.exportSettings")}
        </DialogTitle>
        {field(
          "exportDestination",
          selectedDestination,
          actions.map((action) => ({ value: action.id, label: action.label })),
          setDestination,
        )}
        <div className="flex flex-col gap-4 border-t border-[var(--ui-border-subtle)] pt-5">
          {field(
            "exportResolution",
            String(resolution),
            [480, 720, 1080].map((value) => ({
              value: String(value),
              label:
                value === recommendedResolution
                  ? t("videoEditor.recommendedResolution", {
                      resolution: value,
                    })
                  : `${value}P`,
            })),
            (value) => {
              if (value === "480" || value === "720" || value === "1080")
                setResolution(
                  Number(value) as VideoEditorExportSettings["resolution"],
                );
            },
          )}
          {field(
            "exportContainer",
            format,
            [
              { value: "mp4", label: "MP4" },
              { value: "mov", label: "MOV" },
            ],
            (value) => {
              if (value === "mp4" || value === "mov") setFormat(value);
            },
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="h-10 bg-[var(--ui-bg-control)]"
          >
            {t("videoEditor.cancel")}
          </Button>
          <Button
            disabled={disabled || loading}
            onClick={() => {
              setOpen(false);
              onExport(selectedDestination, { resolution, format });
            }}
            className="h-10 bg-[var(--ui-text-primary)] text-[color:var(--ui-bg-app)] hover:bg-[var(--ui-text-primary)]/90 hover:text-[color:var(--ui-bg-app)]"
          >
            {t("videoEditor.confirmExport")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
