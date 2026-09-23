import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps, ReactElement, ReactNode } from "react";

import { cn } from "../../lib/utils";

export function TooltipProvider({
  delayDuration = 280,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />;
}

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn("mr-video-editor-theme",
          "z-[var(--ui-z-overlay-popover)] rounded-md border border-[var(--border)] bg-[var(--popover)] px-2.5 py-1.5 text-xs text-[color:var(--popover-foreground)] shadow-[var(--ui-shadow-popover)]",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

type TooltipLabelProps = {
  children: ReactElement;
  content: ReactNode;
  side?: ComponentProps<typeof TooltipPrimitive.Content>["side"];
  className?: string;
  disabled?: boolean;
};

export function TooltipLabel({
  children,
  content,
  side = "top",
  className,
  disabled = false,
}: TooltipLabelProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {disabled ? null : (
        <TooltipContent side={side} className={className}>
          {content}
        </TooltipContent>
      )}
    </Tooltip>
  );
}
