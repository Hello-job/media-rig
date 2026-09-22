import { Button } from "../../motion/button/base";
import { RangeSlider } from "../../motion/range-slider";
import { Switch } from "../../motion/switch";
import { Info, SunMedium, Thermometer, X } from "lucide-react";

import { LIGHT_POSITION_PRESETS } from "../LightSphere.constants";
import type { LightSpherePanelValue, LightPositionKey } from "../LightSphere.types";


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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      <div className="flex h-6 items-center justify-between">
        <h2 className="m-0 text-[13px] font-bold leading-none text-white/90">
          全局
        </h2>
        {onClose ? <Button variant="ghost" size="icon"
          type="button"
          className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-white/35 transition-colors hover:bg-white/5 hover:text-white/70"
          aria-label="关闭打光设置"
          onClick={onClose}
        >
          <X className="size-3.5" />
        </Button> : null}
      </div>

      <section className="space-y-1.5">
        <span className="block text-[12px] font-semibold leading-none text-white/60">
          亮度
        </span>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1" onPointerUp={onInteractionEnd} onPointerCancel={onInteractionEnd} onLostPointerCapture={onInteractionEnd} onBlur={onInteractionEnd} onKeyUp={event => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) onInteractionEnd(); }}>
            <RangeSlider className="h-7" showTicks={false} aria-label="亮度" min={0} max={100} step={1} value={brightness} onValueChange={value => onBrightnessChange(value / 100)} formatValueText={value => `${value}%`} />
          </div>
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
          <div className="min-w-0 flex-1" onPointerUp={onInteractionEnd} onPointerCancel={onInteractionEnd} onLostPointerCapture={onInteractionEnd} onBlur={onInteractionEnd} onKeyUp={event => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) onInteractionEnd(); }}>
            <RangeSlider className="h-7" showTicks={false} aria-label="色温" min={2400} max={10000} step={100} value={values.colorTemperature} onValueChange={onColorTemperatureChange} formatValueText={value => `${value} K`} />
          </div>
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
            <Button variant="ghost" size="icon"
              key={position.key}
              type="button"
              className={[
                "h-[22px] w-full cursor-pointer rounded-[7px] border-0 px-1 text-[11px] font-semibold transition-colors",
                values.activePosition === position.key
                  ? "bg-white/20 text-white"
                  : "bg-white/[0.055] text-white/35 hover:bg-white/10 hover:text-white/65",
              ].join(" ")}
              aria-pressed={values.activePosition === position.key}
              onClick={() => onPositionChange(position.key)}
            >
              {position.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-0.5 flex items-center justify-between border-t border-white/[0.07] pt-2.5">
        <span className="flex items-center gap-1 text-[12px] font-semibold text-white/80">
          轮廓光
          <Info className="size-3 text-white/30" aria-hidden="true" />
        </span>
        <Switch checked={values.rimLightEnabled} onCheckedChange={onRimLightChange} ariaLabel="轮廓光" className="scale-75 origin-right" />
      </section>
    </div>
  );
}
