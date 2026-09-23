import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "../../lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn("mr-video-editor-theme",
          "z-[var(--ui-z-overlay-popover)] min-w-48 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--popover)] p-1.5 text-[color:var(--popover-foreground)] shadow-[var(--ui-shadow-popover)] outline-none",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({
  className,
  inset,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      className={cn("mr-video-editor-theme",
        "relative flex cursor-default select-none items-center gap-2 rounded-md px-3 py-2 text-sm text-[color:var(--popover-foreground)] outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:text-[color:var(--muted-foreground)] data-[disabled]:opacity-50 data-[inset=true]:pl-8 focus:bg-[var(--accent)] focus:text-[color:var(--accent-foreground)] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuRadioItem({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn("mr-video-editor-theme",
        "relative flex cursor-default select-none items-center gap-2 rounded-md px-3 py-2 text-sm text-[color:var(--popover-foreground)] outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:text-[color:var(--muted-foreground)] data-[disabled]:opacity-50 focus:bg-[var(--accent)] focus:text-[color:var(--accent-foreground)] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn("mr-video-editor-theme",
        "flex cursor-default select-none items-center gap-2 rounded-md px-3 py-2 text-sm text-[color:var(--popover-foreground)] outline-none transition-colors data-[inset=true]:pl-8 data-[state=open]:bg-[var(--accent)] data-[state=open]:text-[color:var(--accent-foreground)] focus:bg-[var(--accent)] focus:text-[color:var(--accent-foreground)] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto text-[color:var(--muted-foreground)]" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export function DropdownMenuSubContent({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        sideOffset={sideOffset}
        className={cn("mr-video-editor-theme",
          "z-[var(--ui-z-overlay-popover)] min-w-48 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--popover)] p-1.5 text-[color:var(--popover-foreground)] shadow-[var(--ui-shadow-popover)] outline-none",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      className={cn("mr-video-editor-theme",
        "px-3 py-2 text-xs font-medium text-[color:var(--muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("mr-video-editor-theme", "-mx-1 my-1 h-px bg-[var(--border)]", className)}
      {...props}
    />
  );
}
