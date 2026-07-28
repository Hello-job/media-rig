import type React from "react";
import { readVectorInput } from "./DirectorStage.utils";
import type { Vector3Like } from "./DirectorStage.types";

export function IconButton({
  active,
  children,
  label,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? "director-stage__icon-button is-active" : "director-stage__icon-button"}
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function ToolSlot({
  active,
  children,
  menu,
}: {
  active?: boolean;
  children: React.ReactNode;
  menu?: React.ReactNode;
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
  children: React.ReactNode;
  wide?: boolean;
}) {
  return <div className={wide ? "director-stage__tool-menu is-wide" : "director-stage__tool-menu"}>{children}</div>;
}

export function ToolMenuItem({
  active,
  children,
  mark,
  shortcut,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  mark?: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? "director-stage__tool-menu-item is-active" : "director-stage__tool-menu-item"}
      onClick={onClick}
    >
      <span className="director-stage__tool-menu-mark">{mark}</span>
      <span>{children}</span>
      {shortcut ? <kbd>{shortcut}</kbd> : null}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <output>{step < 1 ? value.toFixed(2) : Math.round(value)}</output>
    </label>
  );
}
