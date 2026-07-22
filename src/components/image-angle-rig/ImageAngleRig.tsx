import React, { Suspense, useId, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Aperture, RotateCcw } from "lucide-react";
import {
  DEFAULT_IMAGE_ANGLE_STATE,
  IMAGE_ANGLE_LIMITS,
  normalizeImageAngleState,
} from "./ImageAngleRig.constants";
import type {
  ImageAngleActionButtonProps,
  ImageAngleRigProps,
  ImageAngleState,
} from "./ImageAngleRig.types";
import ImageAngleScene from "./parts/ImageAngleScene";

type AngleKey = "yaw" | "pitch" | "zoom";

const CONTROL_LABELS: Record<AngleKey, string> = {
  yaw: "旋转",
  pitch: "倾斜",
  zoom: "缩放",
};

const ROOT_CLASS = [
  "grid h-full min-h-[460px] w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden",
  "rounded-[14px] border border-[#2b2d31] bg-[#101113] font-sans text-[#f4f5f7]",
  "shadow-[0_18px_54px_rgba(0,0,0,0.28)] max-[760px]:min-h-[700px]",
].join(" ");

const READOUT_CLASS = [
  "min-w-[58px] rounded-md border border-[#303238] bg-[#18191c] text-center",
  "font-mono text-[10px] leading-6 text-[#b8bbc2] tabular-nums",
].join(" ");

const RANGE_CLASS = [
  "m-0 h-4 w-full cursor-ew-resize accent-[#f5f6f8]",
  "focus-visible:rounded focus-visible:outline focus-visible:outline-2",
  "focus-visible:outline-offset-4 focus-visible:outline-white/60",
].join(" ");

const RESET_BUTTON_CLASS = [
  "absolute bottom-4 left-4 z-10 inline-flex h-[34px] items-center justify-center gap-[7px]",
  "rounded-lg border border-[#303238] bg-[#0d0e10]/80 px-3 text-[11px] font-[590] text-[#b9bcc3]",
  "cursor-pointer backdrop-blur-[10px] transition-colors duration-150",
  "hover:border-[#41444b] hover:bg-[#26282d] hover:text-[#f2f3f5]",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white/70",
].join(" ");

const ACTION_BUTTON_CLASS = [
  "inline-flex h-9 min-w-[132px] cursor-pointer items-center justify-center rounded-[9px]",
  "border border-[#f4f5f7] bg-[#f4f5f7] px-4 text-[11px] font-[680] text-[#17181b]",
  "transition duration-150 hover:-translate-y-px hover:border-white hover:bg-white",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white/70",
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

function DefaultActionButton({ className, onClick }: ImageAngleActionButtonProps) {
  return (
    <button type="button" className={className} onClick={onClick}>
      确认调整
    </button>
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
  dragAxisLockThreshold = 8,
  title = "拖拽图片调整角度",
  className = "",
  style,
}: ImageAngleRigProps) {
  const controlId = useId().replace(/:/g, "");
  const [internalValue, setInternalValue] = useState(() => normalizeImageAngleState(defaultValue));
  const isControlled = value !== undefined;
  const currentValue = useMemo(
    () => isControlled ? normalizeImageAngleState(value) : internalValue,
    [internalValue, isControlled, value],
  );

  const updateValue = (nextValue: ImageAngleState) => {
    if (!isControlled) setInternalValue(nextValue);
    onChange?.(nextValue);
  };

  const commitValue = (nextValue: ImageAngleState) => {
    onChangeEnd?.(nextValue);
  };

  const patchValue = (patch: Partial<ImageAngleState>, commit = false) => {
    const nextValue = normalizeImageAngleState({ ...currentValue, ...patch });
    updateValue(nextValue);
    if (commit) commitValue(nextValue);
  };

  const reset = () => {
    const nextValue = { ...DEFAULT_IMAGE_ANGLE_STATE };
    updateValue(nextValue);
    commitValue(nextValue);
  };

  const handleAction: ImageAngleActionButtonProps["onClick"] = (event) => {
    onAction?.({ value: currentValue, input: actionInput }, event);
  };

  const rootClassName = [ROOT_CLASS, className].filter(Boolean).join(" ");

  return (
    <section
      data-slot="image-angle-rig"
      className={rootClassName}
      style={style}
      aria-label={title}
    >
      <header className="flex min-h-16 items-center justify-between gap-5 border-b border-[#303238] px-[18px] py-3 pl-5 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-2.5 max-[760px]:py-3.5">
        <div>
          <h2 className="m-0 text-sm font-[680] leading-[1.35] tracking-[-0.01em]">
            {title}
          </h2>
          <p className="mt-[3px] text-[11px] leading-[1.35] text-[#999da6]">
            在画布中拖拽，或使用参数精确调整
          </p>
        </div>
        <div className="flex items-center gap-1" aria-label="当前角度">
          <span className={READOUT_CLASS}>Y {formatAngle(currentValue.yaw)}</span>
          <span className={READOUT_CLASS}>X {formatAngle(currentValue.pitch)}</span>
          <span className={READOUT_CLASS}>S {formatControlValue("zoom", currentValue.zoom)}</span>
        </div>
      </header>

      <div className="grid min-h-0 grid-cols-[minmax(0,1.28fr)_minmax(300px,0.72fr)] max-[760px]:grid-cols-1 max-[760px]:grid-rows-[minmax(300px,1fr)_auto]">
        <div
          data-slot="canvas-wrap"
          className="relative min-h-0 min-w-0 overflow-hidden border-r border-[#303238] bg-[#151618] [&>div]:h-full [&>div]:w-full [&_canvas]:!block [&_canvas]:!h-full [&_canvas]:!w-full [&_canvas]:touch-none max-[760px]:border-r-0 max-[760px]:border-b"
        >
          <Canvas
            camera={{ position: [0, 0.1, 7.4], fov: currentValue.wideAngle ? 52 : 34 }}
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
            }}
            dpr={[1, 1.5]}
          >
            <Suspense fallback={null}>
              <ImageAngleScene
                imageUrl={imageUrl}
                value={currentValue}
                onChange={updateValue}
                onChangeEnd={commitValue}
                dragAxisLockThreshold={dragAxisLockThreshold}
              />
            </Suspense>
          </Canvas>
          <button
            type="button"
            data-slot="canvas-reset"
            className={RESET_BUTTON_CLASS}
            onClick={reset}
          >
            <RotateCcw size={15} aria-hidden="true" />
            重置角度
          </button>
        </div>

        <div className="flex min-h-0 min-w-0 flex-col bg-[#1b1c1f] px-6 pb-5 pt-6 max-[760px]:p-5">
          <div className="grid gap-[25px] max-[760px]:gap-[18px]">
            {(Object.keys(CONTROL_LABELS) as AngleKey[]).map((key) => {
              const limits = IMAGE_ANGLE_LIMITS[key];
              const inputId = `image-angle-rig-${controlId}-${key}`;
              return (
                <div key={key}>
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <label
                      className="text-xs font-[620] leading-[1.2] text-[#d9dbe0]"
                      htmlFor={inputId}
                    >
                      {CONTROL_LABELS[key]}
                    </label>
                    <output
                      className="min-w-[54px] text-right font-mono text-[11px] text-[#f4f5f7] tabular-nums"
                      htmlFor={inputId}
                    >
                      {formatControlValue(key, currentValue[key])}
                    </output>
                  </div>
                  <input
                    className={RANGE_CLASS}
                    id={inputId}
                    type="range"
                    min={limits.min}
                    max={limits.max}
                    step={limits.step}
                    value={currentValue[key]}
                    aria-valuetext={formatControlValue(key, currentValue[key])}
                    onChange={(event) => patchValue({ [key]: Number(event.target.value) })}
                    onPointerUp={(event) => commitValue(normalizeImageAngleState({
                      ...currentValue,
                      [key]: Number(event.currentTarget.value),
                    }))}
                    onKeyUp={(event) => commitValue(normalizeImageAngleState({
                      ...currentValue,
                      [key]: Number(event.currentTarget.value),
                    }))}
                  />
                  <div className="mt-1 flex justify-between text-[9px] text-[#686c74] tabular-nums" aria-hidden="true">
                    <span>{limits.min}{key === "zoom" ? "" : "°"}</span>
                    <span>{limits.max}{key === "zoom" ? "" : "°"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-2.5 border-t border-[#303238] pt-5">
            <span className="grid size-[34px] place-items-center rounded-lg border border-[#303238] bg-[#202226] text-[#b7bac2]" aria-hidden="true">
              <Aperture size={17} />
            </span>
            <span className="grid gap-[3px]">
              <strong className="text-xs font-[620] leading-[1.2] text-[#d9dbe0]">
                广角镜头
              </strong>
              <small className="text-[10px] leading-tight text-[#7f838c]">
                加强画面的透视纵深
              </small>
            </span>
            <button
              type="button"
              className="group relative h-[22px] w-[38px] cursor-pointer rounded-full border border-[#41444b] bg-[#292b30] p-0 transition-colors duration-150 aria-checked:border-[#f4f5f7] aria-checked:bg-[#f4f5f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white/70"
              role="switch"
              aria-checked={currentValue.wideAngle}
              aria-label="广角镜头"
              onClick={() => patchValue({ wideAngle: !currentValue.wideAngle }, true)}
            >
              <span className="absolute left-[3px] top-[3px] size-3.5 rounded-full bg-[#f4f5f7] shadow-[0_1px_4px_rgba(0,0,0,0.36)] transition duration-150 group-aria-checked:translate-x-4 group-aria-checked:bg-[#17181b]" />
            </button>
          </div>

          <div data-slot="action-slot" className="mt-auto flex justify-end max-[760px]:mt-5">
            <ActionButton
              className={ACTION_BUTTON_CLASS}
              value={currentValue}
              input={actionInput}
              onClick={handleAction}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
