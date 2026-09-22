import { Button } from "../motion/button/base";
import { RangeSlider } from "../motion/range-slider";
import { Switch } from "../motion/switch";
import React, { useMemo, useRef, useState } from "react";
import { ArrowUp, LoaderCircle, RotateCcw, X } from "lucide-react";
import {
  DEFAULT_IMAGE_ANGLE_STATE,
  IMAGE_ANGLE_LIMITS,
  normalizeImageAngleState,
  getImageAngleDragValue,
} from "./ImageAngleRig.constants";
import type {
  ImageAngleActionButtonProps,
  ImageAngleRigProps,
  ImageAngleState,
} from "./ImageAngleRig.types";
import ImageAngleScene from "./parts/ImageAngleScene";

type AngleKey = "yaw" | "pitch" | "zoom";

const CONTROL_LABELS: Record<AngleKey, string> = {
  yaw: "水平旋转",
  pitch: "垂直倾斜",
  zoom: "镜头推进",
};

const ROOT_CLASS = [
  "nodrag h-[320px] w-[560px] max-w-full overflow-hidden rounded-[20px]",
  "border border-white/[0.08] bg-[#191919] font-sans text-white",
  "shadow-[0_22px_70px_rgba(0,0,0,0.56)] max-[480px]:h-auto",
].join(" ");


const RESET_BUTTON_CLASS = [
  "absolute bottom-3 right-3 inline-flex h-auto w-auto whitespace-nowrap cursor-pointer items-center gap-1 rounded-md px-1.5 py-1",
  "text-[10px] text-white/30 transition-colors hover:bg-white/5 hover:text-white/60",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60",
].join(" ");

const ACTION_BUTTON_CLASS = [
  "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white p-0 text-black shadow-sm",
  "transition-colors hover:bg-white/85 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60",
].join(" ");

function formatAngle(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return `${Object.is(rounded, -0) ? 0 : rounded}°`;
}

function formatControlValue(key: AngleKey, value: number) {
  if (key !== "zoom") return formatAngle(value);
  const rounded = Math.round(value * 10) / 10;
  return `${Object.is(rounded, -0) ? 0 : rounded}`;
}

function DefaultActionButton({ className, onClick, disabled, loading }: ImageAngleActionButtonProps) {
  return (
    <Button variant="ghost" size="icon" type="button" className={className} onClick={onClick} disabled={disabled} aria-busy={loading} aria-label={loading ? "处理中" : "确认调整"} title={loading ? "处理中" : "确认调整"}>
      {loading ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <ArrowUp size={16} aria-hidden="true" />}
    </Button>
  );
}

export default function ImageAngleRig({
  imageUrl = "/assets/photo-texture2.png",
  value,
  defaultValue,
  onChange,
  onChangeEnd,
  actionButton: ActionButton = DefaultActionButton,
  actionInput,
  onAction,
  actionLoading = false,
  actionDisabled = false,
  onClose,
  dragThreshold,
  dragAxisLockThreshold,
  title = "视角",
  className = "",
  style,
}: ImageAngleRigProps) {
  const [internalValue, setInternalValue] = useState(() => normalizeImageAngleState(defaultValue));
  const isControlled = value !== undefined;
  const currentValue = useMemo(
    () => isControlled ? normalizeImageAngleState(value) : internalValue,
    [internalValue, isControlled, value],
  );

  const latestValue = useRef(currentValue);
  latestValue.current = currentValue;
  const dragStart = useRef<{
    pointerId: number;
    x: number;
    y: number;
    value: ImageAngleState;
    changed: boolean;
  } | null>(null);
  const pendingControl = useRef<AngleKey | null>(null);
  const [dragging, setDragging] = useState(false);
  const threshold = Math.max(0, dragThreshold ?? dragAxisLockThreshold ?? 3);

  const updateValue = (nextValue: ImageAngleState) => {
    latestValue.current = nextValue;
    if (!isControlled) setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  const patchValue = (patch: Partial<ImageAngleState>, commit = false) => {
    const nextValue = normalizeImageAngleState({ ...latestValue.current, ...patch });
    updateValue(nextValue);
    if (commit) onChangeEnd?.(nextValue);
  };

  const commitControl = (key: AngleKey) => {
    if (pendingControl.current !== key) return;
    pendingControl.current = null;
    onChangeEnd?.(latestValue.current);
  };

  const reset = () => {
    pendingControl.current = null;
    const nextValue = { ...DEFAULT_IMAGE_ANGLE_STATE };
    updateValue(nextValue);
    onChangeEnd?.(nextValue);
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || dragStart.current) return;
    event.preventDefault();
    event.stopPropagation();
    dragStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      value: latestValue.current,
      changed: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (!start.changed && Math.hypot(deltaX, deltaY) < threshold) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const nextValue = getImageAngleDragValue(start.value, deltaX, deltaY, rect.width, rect.height);
    if (nextValue.yaw === latestValue.current.yaw && nextValue.pitch === latestValue.current.pitch) return;
    start.changed = true;
    // Other controls may change during a captured drag; only patch its angles.
    patchValue({ yaw: nextValue.yaw, pitch: nextValue.pitch });
  };

  const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    event.stopPropagation();
    dragStart.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
    if (start.changed) onChangeEnd?.(latestValue.current);
  };

  const handleAction: ImageAngleActionButtonProps["onClick"] = (event) => {
    event.stopPropagation();
    if (actionLoading || actionDisabled) return;
    onAction?.({ value: latestValue.current, input: actionInput }, event);
  };

  const rootClassName = [ROOT_CLASS, className].filter(Boolean).join(" ");

  return (
    <section
      data-slot="image-angle-rig"
      className={rootClassName}
      style={style}
      aria-label={title}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,300fr)_minmax(220px,260fr)] max-[480px]:grid-cols-1">
        <div data-slot="canvas-wrap" className="relative min-h-0 min-w-0 overflow-hidden bg-[#20201f] max-[480px]:h-[240px]">
          <div
            data-slot="angle-drag-surface"
            className="relative flex size-full touch-none select-none items-center justify-center overflow-hidden"
            style={{ cursor: dragging ? "grabbing" : "grab", perspective: "1000px" }}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={finishDrag}
            onPointerCancel={finishDrag}
            onLostPointerCapture={finishDrag}
          >
            <span className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap rounded-[9px] bg-black/20 px-3 py-1.5 text-[10px] font-semibold text-white/45">拖动调整视角</span>
            <ImageAngleScene imageUrl={imageUrl} value={currentValue} />
          </div>
          <Button variant="ghost" size="icon"
            type="button"
            data-slot="canvas-reset"
            aria-label="重置角度"
            className={RESET_BUTTON_CLASS}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => { event.stopPropagation(); reset(); }}
          >
            <RotateCcw size={12} aria-hidden="true" />
            重置
          </Button>
        </div>

        <aside className="flex min-h-0 min-w-0 flex-col border-l border-white/[0.06] bg-[#191919] px-3 pb-2.5 pt-2.5 max-[480px]:border-l-0 max-[480px]:border-t">
          <header className="flex h-6 items-center justify-between">
            <h2 className="m-0 text-[13px] font-bold leading-none text-white/90">{title}</h2>
            {onClose ? (
              <Button variant="ghost" size="icon"
                type="button"
                aria-label="关闭多角度设置"
                className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full text-white/35 transition-colors hover:bg-white/5 hover:text-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
                onClick={(event) => { event.stopPropagation(); onClose(); }}
              >
                <X size={14} aria-hidden="true" />
              </Button>
            ) : null}
          </header>

          <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2.5">
            {(Object.keys(CONTROL_LABELS) as AngleKey[]).map((key) => {
              const limits = IMAGE_ANGLE_LIMITS[key];
              return (
                <div key={key} className="space-y-1.5">
                  <span className="block text-xs font-semibold leading-none text-white/60">
                    {CONTROL_LABELS[key]}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1" onPointerUp={() => commitControl(key)} onPointerCancel={() => commitControl(key)} onLostPointerCapture={() => commitControl(key)} onBlur={() => commitControl(key)} onKeyUp={event => {
                      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) commitControl(key);
                    }}>
                      <RangeSlider className="h-7" showTicks={false} min={limits.min} max={limits.max} step={limits.step} value={currentValue[key]} aria-label={CONTROL_LABELS[key]} formatValueText={value => formatControlValue(key, value)} onValueChange={value => {
                        pendingControl.current = key;
                        patchValue({ [key]: value });
                      }} />
                    </div>
                    <output className="flex h-7 min-w-[76px] items-center justify-center rounded-lg bg-white/[0.055] px-2 text-xs font-semibold text-white/90 tabular-nums">
                      {formatControlValue(key, currentValue[key])}
                    </output>
                  </div>
                </div>
              );
            })}

            <div className="mt-0.5 flex items-center justify-between border-t border-white/[0.07] pt-2.5" onClick={event => event.stopPropagation()}>
              <span className="text-xs font-semibold text-white/80">广角镜头</span>
              <Switch checked={currentValue.wideAngle} onCheckedChange={wideAngle => patchValue({ wideAngle }, true)} ariaLabel="广角镜头" className="scale-75 origin-right" />
            </div>
          </div>

          <div data-slot="action-slot" className="mt-auto flex justify-end pt-1.5">
            <ActionButton
              className={ACTION_BUTTON_CLASS}
              value={currentValue}
              input={actionInput}
              onClick={handleAction}
              disabled={actionDisabled || actionLoading}
              loading={actionLoading}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
