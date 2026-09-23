import { AudioLines, Film, Plus } from "lucide-react";
import { Button } from "./internal/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./internal/components/ui/dropdown-menu";
import { useI18n } from "./video-editor-context";
import type { useVideoEditor } from "./use-video-editor";

export function EditSourceMenu({
  session,
  kind,
  empty = false,
}: {
  session: ReturnType<typeof useVideoEditor>;
  kind: "video" | "audio";
  empty?: boolean;
}) {
  const { t } = useI18n();
  const label = t(
    kind === "video" ? "videoEditor.addVideo" : "videoEditor.addAudio",
  );
  const Icon = kind === "video" ? Film : AudioLines;
  const sources = session.sources.filter((source) => source.kind === kind);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={empty ? "outline" : "ghost"}
          size={empty ? "default" : "icon"}
          disabled={Boolean(session.busy) || session.readOnly}
          aria-label={label}
          title={label}
          className={
            empty ? "text-[color:var(--ui-text-secondary)]" : "size-8 text-[color:var(--ui-text-secondary)]"
          }
        >
          <Icon className="size-4" />
          {empty && label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="video-editor max-h-80 w-64 overflow-y-auto"
        align="start"
      >
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {sources.map((source) => (
          <DropdownMenuItem
            key={source.id}
            onSelect={() => void session.addSource(source.id)}
          >
            <span className="min-w-0 flex-1 truncate">{source.label}</span>
            <Plus className="size-4" />
          </DropdownMenuItem>
        ))}
        {sources.length === 0 && (
          <DropdownMenuItem disabled>
            {t("videoEditor.connectHint")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
