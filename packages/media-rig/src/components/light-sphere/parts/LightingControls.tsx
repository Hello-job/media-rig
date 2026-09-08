import type { CSSProperties } from "react";
import { Info, SunMedium, Thermometer, X } from "lucide-react";

import { LIGHT_POSITION_PRESETS } from "../LightSphere.constants";
import type { LightSpherePanelValue, LightPositionKey } from "../LightSphere.types";

type SliderStyle = CSSProperties & {
  "--slider-value": string;
};

type LightingControlsProps = {
  values: LightSpherePanelValue;
  onBrightnessChange: (intensity: number) => void;
  onColorTemperatureChange: (temperature: number) => void;
  onPositionChange: (position: LightPositionKey) => void;
  onRimLightChange: (enabled: boolean) => void;
  onClose?: () => void;
  onInteractionEnd: () => void;
};

export function LightingControls({
  values,
  onBrightnessChange,
  onColorTemperatureChange,
  onPositionChange,
  onRimLightChange,
  onClose,
  onInteractionEnd,
}: LightingControlsProps) {
  const brightness = Math.round(values.intensity * 100);
  const sliderClass = [
    "h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60",
    "[&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full",
    "[&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.45)]",
    "[&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none",
    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-white",
    "[&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.45)]",
  ].join(" ");
  const brightnessSliderStyle: SliderStyle = {
    "--slider-value": `${brightness}%`,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      <div className="flex h-6 items-center justify-between">
        <h2 className="m-0 text-[13px] font-bold leading-none text-white/90">
          全局
        </h2>
        {onClose ? <button
          type="button"
          className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-white/35 transition-colors hover:bg-white/5 hover:text-white/70"
          aria-label="关闭打光设置"
          onClick={onClose}
        >
          <X className="size-3.5" />
        </button> : null}
      </div>

      <section className="space-y-1.5">
        <span className="block text-[12px] font-semibold leading-none text-white/60">
          亮度
        </span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            onPointerUp={onInteractionEnd}
            onPointerCancel={onInteractionEnd}
            onBlur={onInteractionEnd}
            onKeyUp={(event) => {
              if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) onInteractionEnd();
            }}
            min={0}
            max={100}
            step={1}
            value={brightness}
            onChange={(event) =>
              onBrightnessChange(Number(event.target.value) / 100)
            }
            className={`${sliderClass} bg-[linear-gradient(to_right,rgba(255,255,255,0.72)_0_var(--slider-value),rgba(255,255,255,0.12)_var(--slider-value)_100%)]`}
            style={brightnessSliderStyle}
            aria-label="亮度"
          />
          <output className="flex h-7 w-20 flex-none items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-white/[0.055] px-2 text-xs font-semibold text-white/90 tabular-nums">
            <SunMedium className="size-3.5 text-white/65" />
            {brightness}
            <span className="text-white/35">%</span>
          </output>
        </div>
      </section>

      <section className="space-y-1.5">
        <span className="block text-[12px] font-semibold leading-none text-white/60">
          色温
        </span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            onPointerUp={onInteractionEnd}
            onPointerCancel={onInteractionEnd}
            onBlur={onInteractionEnd}
            onKeyUp={(event) => {
              if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) onInteractionEnd();
            }}
            min={2400}
            max={10000}
            step={100}
            value={values.colorTemperature}
            onChange={(event) =>
              onColorTemperatureChange(Number(event.target.value))
            }
            className={`${sliderClass} bg-[linear-gradient(to_right,#7c5425_0%,#d7a65c_36%,#d9e3e3_62%,#56777f_100%)]`}
            aria-label="色温"
          />
          <output className="flex h-7 w-20 flex-none items-center justify-center gap-1 whitespace-nowrap rounded-lg bg-white/[0.055] px-2 text-xs font-semibold text-white/90 tabular-nums">
            <Thermometer className="size-3.5 text-white/65" />
            {values.colorTemperature} K
          </output>
        </div>
      </section>

      <section className="space-y-1.5">
        <span className="block text-[12px] font-semibold leading-none text-white/80">
          主光源
        </span>
        <div className="grid grid-cols-3 gap-1">
          {LIGHT_POSITION_PRESETS.map((position) => (
            <button
              key={position.key}
              type="button"
              className={[
                "h-[22px] cursor-pointer rounded-[7px] border-0 px-1 text-[11px] font-semibold transition-colors",
                values.activePosition === position.key
                  ? "bg-white/20 text-white"
                  : "bg-white/[0.055] text-white/35 hover:bg-white/10 hover:text-white/65",
              ].join(" ")}
              aria-pressed={values.activePosition === position.key}
              onClick={() => onPositionChange(position.key)}
            >
              {position.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-0.5 flex items-center justify-between border-t border-white/[0.07] pt-2.5">
        <span className="flex items-center gap-1 text-[12px] font-semibold text-white/80">
          轮廓光
          <Info className="size-3 text-white/30" aria-hidden="true" />
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={values.rimLightEnabled}
          aria-label="轮廓光"
          className="group relative h-[18px] w-8 cursor-pointer rounded-full border-0 bg-white/15 p-0 transition-colors aria-checked:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          onClick={() => onRimLightChange(!values.rimLightEnabled)}
        >
          <span className="absolute left-0.5 top-0.5 size-3.5 rounded-full bg-white/60 shadow-sm transition-transform group-aria-checked:translate-x-3.5 group-aria-checked:bg-white" />
        </button>
      </section>
    </div>
  );
}
