import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn("mr-video-editor-theme",
        "min-h-20 w-full min-w-0 rounded-[var(--ui-radius-md)] border border-[var(--input)] bg-[var(--secondary)] px-3 py-2 text-sm text-[color:var(--foreground)] outline-none transition-colors placeholder:text-[color:var(--muted-foreground)] focus-visible:bg-[var(--ui-bg-control-active)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
