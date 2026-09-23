import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";
import type { IconGraphicProps } from "../icon.types";

export function IconBase({
  size = 16,
  className,
  children,
  ...props
}: IconGraphicProps & { children: ReactNode }) {
  const labelled = Boolean(props["aria-label"] || props["aria-labelledby"]);

  return (
    <svg
      aria-hidden={labelled ? undefined : true}
      role={labelled ? "img" : undefined}
      focusable="false"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  );
}
