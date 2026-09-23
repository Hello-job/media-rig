import type { ComponentType, SVGProps } from "react";
import { Button } from "./internal/components/ui/button";
import { TooltipLabel } from "./internal/components/ui/tooltip";
import { useI18n } from "./video-editor-context";
import { cn } from "./internal/lib/utils";

export function EditIconButton({
  label,
  icon: Icon,
  active,
  disabled,
  onClick,
  className,
}: {
  label: string;
  icon: ComponentType<
    Pick<SVGProps<SVGSVGElement>, "className" | "strokeWidth">
  >;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}) {
  const { t } = useI18n();
  const name = t(`videoEditor.${label}`);
  return (
    <TooltipLabel content={name}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={name}
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          "size-8 shrink-0 text-[color:var(--ui-text-secondary)]",
          active && "bg-[var(--ui-bg-control-active)] text-[color:var(--ui-text-primary)]",
          className,
        )}
      >
        <Icon className="size-4" strokeWidth={1.7} />
      </Button>
    </TooltipLabel>
  );
}
