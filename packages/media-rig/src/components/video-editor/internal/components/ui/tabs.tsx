"use client";
// beui.dev/components/motion/tabs

import * as TabsPrimitive from "@radix-ui/react-tabs";
import {
  motion,
  MotionConfig,
  useReducedMotion,
  type Transition,
} from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import { EASE_OUT } from "../../lib/ease";
import { cn } from "../../lib/utils";

type Variant = "pill" | "underline" | "segment";

type Ctx = {
  value: string;
  layoutId: string;
  variant: Variant;
};

const TabsCtx = createContext<Ctx | null>(null);

function useTabs() {
  const ctx = useContext(TabsCtx);
  if (!ctx) throw new Error("Tabs.* must be used inside <Tabs>");
  return ctx;
}

// Settle without overshoot: a scrollable tab list would turn even a small
// overshoot into a transient scrollbar and layout shift.
const transition: Transition = {
  type: "spring",
  stiffness: 170,
  damping: 30,
  mass: 1.2,
};

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  variant = "pill",
  children,
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root> & { variant?: Variant }) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const layoutId = useId();
  const reduce = useReducedMotion();
  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const setValue = useCallback(
    (v: string) => {
      if (!controlled) setInternal(v);
      onValueChange?.(v);
    },
    [controlled, onValueChange],
  );
  const contextValue = useMemo(
    () => ({ value: current, layoutId, variant }),
    [current, layoutId, variant],
  );
  return (
    <MotionConfig transition={reduce ? { duration: 0 } : transition}>
      <TabsCtx.Provider value={contextValue}>
        {/* layoutRoot: the indicator's layoutId measures in page coordinates, so
            inside fixed/scrolled containers it would replay scroll offsets as
            movement. The pill only ever travels within the list, so scoping
            projection to the Tabs wrapper is always correct. */}
        <TabsPrimitive.Root
          {...props}
          value={current}
          onValueChange={setValue}
          asChild
        >
          <motion.div layoutRoot className={className}>
            {children}
          </motion.div>
        </TabsPrimitive.Root>
      </TabsCtx.Provider>
    </MotionConfig>
  );
}

const listClasses: Record<Variant, string> = {
  pill: "inline-flex items-center gap-1 rounded-full bg-[var(--card)] p-1",
  underline: "inline-flex items-center gap-1 border-b border-[var(--border)]",
  segment: "inline-flex items-center gap-0 rounded-lg bg-[var(--card)] p-0.5",
};

export function TabsList({
  children,
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  const { variant } = useTabs();
  return (
    <TabsPrimitive.List
      {...props}
      className={cn("mr-video-editor-theme", listClasses[variant], className)}
    >
      {children}
    </TabsPrimitive.List>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  indicatorClassName,
  onClick,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger> & {
  indicatorClassName?: string;
}) {
  const { value: current, layoutId, variant } = useTabs();
  const active = current === value;

  if (variant === "underline") {
    return (
      <TabsPrimitive.Trigger
        {...props}
        value={value}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) event.currentTarget.focus();
        }}
        className={cn("mr-video-editor-theme",
          "outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50 disabled:pointer-events-none disabled:opacity-50 relative isolate px-3 pb-2.5 pt-1 -mb-px text-sm font-medium transition-colors min-h-[44px] inline-flex items-center",
          active
            ? "text-[color:var(--foreground)]"
            : "text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]",
          className,
        )}
      >
        {children}
        {active ? (
          <motion.span
            layoutId={layoutId}
            layout="position"
            className={cn("mr-video-editor-theme",
              "absolute -bottom-px left-0 right-0 h-px bg-[var(--primary)]",
              indicatorClassName,
            )}
          />
        ) : null}
      </TabsPrimitive.Trigger>
    );
  }

  const radius = variant === "pill" ? "rounded-full" : "rounded-md";

  return (
    <div className="relative">
      {active ? (
        <motion.span
          layoutId={layoutId}
          layout="position"
          style={{ borderRadius: variant === "pill" ? 9999 : 8 }}
          className={cn("mr-video-editor-theme",
            "absolute inset-0 bg-[var(--primary)]",
            radius,
            indicatorClassName,
          )}
        />
      ) : null}
      <TabsPrimitive.Trigger
        {...props}
        value={value}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) event.currentTarget.focus();
        }}
        className={cn("mr-video-editor-theme",
          "relative z-10 inline-flex items-center justify-center whitespace-nowrap bg-transparent px-3.5 py-1.5 text-sm font-medium outline-none",
          "transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50 disabled:pointer-events-none disabled:opacity-50",
          active
            ? "text-[color:var(--primary-foreground)]"
            : "text-[color:var(--muted-foreground)] hover:text-[color:var(--foreground)]",
          radius,
          className,
        )}
      >
        {children}
      </TabsPrimitive.Trigger>
    </div>
  );
}

export function TabsContent({
  value,
  children,
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  const { value: current } = useTabs();
  const reduce = useReducedMotion();
  const active = current === value;
  return (
    <TabsPrimitive.Content
      {...props}
      value={value}
      forceMount
      hidden={!active}
      asChild
    >
      <motion.div
        initial={false}
        animate={{ opacity: active ? 1 : 0, y: active || reduce ? 0 : 4 }}
        transition={{ duration: reduce ? 0 : 0.18, ease: EASE_OUT }}
        className={cn("mr-video-editor-theme",
          "mt-4 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50",
          className,
        )}
      >
        {children}
      </motion.div>
    </TabsPrimitive.Content>
  );
}
