import type { ComponentProps } from "react";

import { cn } from "../../lib/utils";

export function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn("mr-video-editor-theme",
        "h-9 w-full min-w-0 rounded-md border border-[var(--input)] bg-[var(--secondary)] px-3 py-1 text-sm text-[color:var(--foreground)] outline-none transition-colors placeholder:text-[color:var(--muted-foreground)] focus-visible:bg-[var(--ui-bg-control-active)] disabled:cursor-not-allowed disabled:text-[color:var(--muted-foreground)] disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
