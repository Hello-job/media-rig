import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export function ContextMenu(
  props: ComponentProps<typeof ContextMenuPrimitive.Root>,
) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

export function ContextMenuTrigger(
  props: ComponentProps<typeof ContextMenuPrimitive.Trigger>,
) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

export function ContextMenuGroup(
  props: ComponentProps<typeof ContextMenuPrimitive.Group>,
) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

export function ContextMenuPortal(
  props: ComponentProps<typeof ContextMenuPrimitive.Portal>,
) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

export function ContextMenuSub(
  props: ComponentProps<typeof ContextMenuPrimitive.Sub>,
) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

export function ContextMenuRadioGroup(
  props: ComponentProps<typeof ContextMenuPrimitive.RadioGroup>,
) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

export function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn("mr-video-editor-theme",
        "flex cursor-default select-none items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[color:var(--popover-foreground)] outline-none data-[highlighted]:bg-[var(--accent)] data-[highlighted]:text-[color:var(--accent-foreground)] data-[state=open]:bg-[var(--accent)] data-[state=open]:text-[color:var(--accent-foreground)] data-[disabled]:pointer-events-none data-[disabled]:text-[color:var(--muted-foreground)] data-[disabled]:opacity-50 data-[inset=true]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto size-4 text-[color:var(--muted-foreground)]" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

export function ContextMenuSubContent({
  className,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn("mr-video-editor-theme",
        "z-[var(--ui-z-popover)] min-w-64 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--popover)] p-2 text-[color:var(--popover-foreground)] shadow-[var(--ui-shadow-popover)] outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function ContextMenuContent({
  className,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPortal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn("mr-video-editor-theme",
          "z-[var(--ui-z-popover)] min-w-48 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--popover)] p-1.5 text-[color:var(--popover-foreground)] shadow-[var(--ui-shadow-popover)] outline-none",
          className,
        )}
        {...props}
      />
    </ContextMenuPortal>
  );
}

export function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn("mr-video-editor-theme",
        "relative flex cursor-default select-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--popover-foreground)] outline-none data-[highlighted]:bg-[var(--accent)] data-[highlighted]:text-[color:var(--accent-foreground)] data-[disabled]:pointer-events-none data-[disabled]:text-[color:var(--muted-foreground)] data-[disabled]:opacity-50 data-[inset=true]:pl-8 data-[variant=destructive]:text-[color:var(--destructive)] data-[variant=destructive]:data-[highlighted]:bg-[var(--destructive)]/15 data-[variant=destructive]:data-[highlighted]:text-[color:var(--destructive)] [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn("mr-video-editor-theme",
        "relative flex cursor-default select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-[color:var(--popover-foreground)] outline-none data-[highlighted]:bg-[var(--accent)] data-[highlighted]:text-[color:var(--accent-foreground)] data-[disabled]:pointer-events-none data-[disabled]:text-[color:var(--muted-foreground)] data-[disabled]:opacity-50",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2.5 flex size-4 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Check className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

export function ContextMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn("mr-video-editor-theme",
        "relative flex cursor-default select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-[color:var(--popover-foreground)] outline-none data-[highlighted]:bg-[var(--accent)] data-[highlighted]:text-[color:var(--accent-foreground)] data-[disabled]:pointer-events-none data-[disabled]:text-[color:var(--muted-foreground)] data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2.5 flex size-4 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <Circle className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

export function ContextMenuLabel({
  className,
  inset,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Label> & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn("mr-video-editor-theme",
        "px-3 py-2 text-xs font-medium text-[color:var(--muted-foreground)] data-[inset=true]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

export function ContextMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("mr-video-editor-theme", "-mx-0.5 my-1 h-px bg-[var(--border)]", className)}
      {...props}
    />
  );
}

export function ContextMenuShortcut({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn("mr-video-editor-theme", "ml-auto pl-5 text-xs text-[color:var(--muted-foreground)]", className)}
      {...props}
    />
  );
}
