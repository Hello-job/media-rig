import { LoaderIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export function Spinner({ className, ...props }: ComponentProps<"svg">) {
  return (
    <LoaderIcon
      aria-label="Loading"
      role="status"
      className={cn("mr-video-editor-theme", "size-4 animate-spin", className)}
      {...props}
    />
  );
}
