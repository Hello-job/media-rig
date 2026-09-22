import { RangeSlider } from "../motion/range-slider";
import { Tooltip } from "../motion/tooltip";
import { Button } from "../motion/button/base";
import { useEffect, useRef, type ReactNode } from "react";
import { readVectorInput } from "./DirectorStage.utils";
import type { Vector3Like } from "./DirectorStage.types";

export function IconButton({
  active,
  children,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip content={label}>
    <Button variant="ghost" size="icon"
      type="button"
      className={active ? "director-stage__icon-button is-active" : "director-stage__icon-button"}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
    </Tooltip>
  );
}

export function ToolSlot({
  active,
  children,
  menu,
}: {
  active?: boolean;
  children: ReactNode;
  menu?: ReactNode;
}) {
  return (
    <div className={active ? "director-stage__tool-slot is-active" : "director-stage__tool-slot"}>
      {children}
      {menu}
    </div>
  );
}

export function ToolMenuPanel({
  children,
  wide,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { root.current?.querySelector<HTMLButtonElement>("button")?.focus(); }, []);
  return <div ref={root} className={wide ? "director-stage__tool-menu is-wide" : "director-stage__tool-menu"} onKeyDown={(event) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const items = Array.from(root.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
    if (!items.length) return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items[next].focus();
  }}>{children}</div>;
}

export function ToolMenuItem({
  active,
  children,
  mark,
  shortcut,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  mark?: ReactNode;
  shortcut?: string;
  onClick: () => void;
}) {
  return (
    <Button variant="ghost" size="icon"
      type="button"
      className={active ? "director-stage__tool-menu-item is-active" : "director-stage__tool-menu-item"}
      onClick={onClick}
    >
      <span className="director-stage__tool-menu-mark">{mark}</span>
      <span>{children}</span>
      {shortcut ? <kbd>{shortcut}</kbd> : null}
    </Button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="director-stage__field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function VectorEditor({
  label,
  value,
  onChange,
  step = 0.1,
}: {
  label: string;
  value: Vector3Like;
  onChange: (value: Vector3Like) => void;
  step?: number;
}) {
  return (
    <div className="director-stage__vector">
      <span>{label}</span>
      {(["x", "y", "z"] as const).map((axis) => (
        <input
          key={axis}
          aria-label={`${label} ${axis}`}
          type="number"
          step={step}
          value={Number(value[axis].toFixed(2))}
          onChange={(event) => onChange(readVectorInput(value, axis, event.target.value))}
        />
      ))}
    </div>
  );
}

export function JointSlider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="director-stage__slider">
      <span>{label}</span>
      <RangeSlider className="h-7" showTicks={false} aria-label={label} min={min} max={max} step={step} value={value} onValueChange={onChange} />
      <output>{step < 1 ? value.toFixed(2) : Math.round(value)}</output>
    </label>
  );
}
