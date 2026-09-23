// Adapted from beUI (MIT); see docs/licenses/beui-MIT.txt.
"use client";
// beui.dev/components/motion/range-slider

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { type ReactNode, useEffect } from "react";

import { SPRING_GLIDE, SPRING_PRESS } from "../../lib/ease";
import { type SliderOptions, useSlider } from "../../lib/hooks/use-slider";
import { TOUCH_GESTURE_CLASS } from "../../lib/touch";
import { cn } from "../../lib/utils";

export interface FluidSliderProps extends SliderOptions {
  /** Text shown on the left of the track. */
  label?: string;
  /** Formats the value shown on the right. */
  format?: (value: number) => string;
  /** Optional editable readout, rendered once above the liquid fill. */
  renderValue?: (value: number) => ReactNode;
  className?: string;
}

/**
 * Thumbless slider with a soft fill and a rounded liquid cap.
 */
export function FluidSlider({
  label,
  // The value arrives already snapped to the step. Rounding it again would
  // only make the label and the announcement disagree with aria-valuenow.
  format = (v) => `${v}%`,
  className,
  renderValue,
  ...options
}: FluidSliderProps) {
  const reduce = useReducedMotion();
  const { percent, current, dragging, trackProps, sliderProps } = useSlider({
    ...options,
    "aria-label": options["aria-label"] ?? label,
    formatValueText: options.formatValueText ?? format,
  });

  const target = useMotionValue(percent);
  useEffect(() => {
    target.set(percent);
  }, [percent, target]);
  const smooth = useSpring(target, SPRING_GLIDE);
  const pos = reduce ? target : smooth;
  // Reveal the fill by clipping a full-width layer rather than animating its
  // width: at 0% the clip is empty, so no hairline of a sub-pixel-wide box is
  // left behind, and the label inside is never scaled or re-laid out.
  const uncovered = useTransform(pos, (v) => 100 - v);
  const clipPath = useMotionTemplate`inset(0 ${uncovered}% 0 0 round var(--ui-radius-md))`;

  const row = (
    <>
      {label ? <span className="truncate">{label}</span> : <span />}
      {!renderValue && <span className="tabular-nums">{format(current)}</span>}
    </>
  );

  return (
    <motion.div
      {...trackProps}
      onPointerDown={(event) => {
        if ((event.target as Element).closest("[data-slider-value]")) return;
        trackProps.onPointerDown(event);
      }}
      animate={reduce ? undefined : { scale: dragging ? 1.03 : 1 }}
      transition={SPRING_PRESS}
      className={cn("mr-video-editor-theme",
        "relative isolate flex h-10 w-full shrink-0 touch-none overflow-hidden rounded-[var(--ui-radius-md)] bg-[var(--muted)] hover:bg-[var(--muted)]/80",
        TOUCH_GESTURE_CLASS,
        options.disabled
          ? "pointer-events-none opacity-50"
          : "cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[var(--foreground)]/10"
        style={{ clipPath }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-between px-5 text-sm font-medium text-[color:var(--foreground)]"
      >
        {row}
      </div>

      {renderValue && (
        <div
          data-slider-value=""
          className="absolute inset-y-0 right-5 z-10 flex max-w-[40%] items-center text-sm font-medium text-[color:var(--foreground)]"
        >
          {renderValue(current)}
        </div>
      )}

      {/* focusable, keyboard-controlled handle surface. The ring is inset — an
          outset one is clipped away by the track's overflow-hidden. */}
      <button
        type="button"
        {...sliderProps}
        className="absolute inset-0 touch-none rounded-[var(--ui-radius-md)] outline-none ring-inset focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      />
    </motion.div>
  );
}
