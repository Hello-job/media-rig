import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, Ref } from "react";
import { cn } from "../../lib/utils";

const primaryButtonClassName =
  "bg-[var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[var(--primary)]/90 active:bg-[var(--primary)]/80";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[var(--ring)]/50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: primaryButtonClassName,
        primary: primaryButtonClassName,
        destructive:
          "bg-[var(--destructive)] text-[color:var(--destructive-foreground)] hover:bg-[var(--destructive)]/90 active:bg-[var(--destructive)]/80",
        outline:
          "border border-[var(--border)] bg-transparent text-[color:var(--foreground)] hover:bg-[var(--accent)] hover:text-[color:var(--accent-foreground)] active:bg-[var(--accent)]/80",
        ghost:
          "text-[color:var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[color:var(--accent-foreground)] active:bg-[var(--accent)]/80",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> &
  VariantProps<typeof buttonVariants> & {
    type?: ButtonHTMLAttributes<HTMLButtonElement>["type"] | "primary";
    htmlType?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
    asChild?: boolean;
    ref?: Ref<HTMLButtonElement>;
  };

export function Button({
  className,
  variant,
  size,
  type,
  htmlType,
  asChild = false,
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      data-slot="button"
      type={htmlType ?? (type === "primary" ? "button" : type)}
      className={cn("mr-video-editor-theme",
        buttonVariants({
          variant: type === "primary" ? "primary" : variant,
          size,
          className,
        }),
      )}
      {...props}
    />
  );
}
