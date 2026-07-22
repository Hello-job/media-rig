import type { CSSProperties } from "react";
import type { LightSphereConfig } from "../../index";

export type LightPositionPreset = {
  key: string;
  label: string;
  lat: number;
  lon: number;
};

type LightSphereControlsProps = {
  config: LightSphereConfig;
  colorTemperature: number;
  onChange: (config: LightSphereConfig) => void;
  onColorTemperatureChange: (temperature: number) => void;
  activePosition: string;
  onPositionChange: (position: LightPositionPreset) => void;
};

type SliderStyle = CSSProperties & {
  "--slider-value": string;
};

const POSITIONS: LightPositionPreset[] = [
  { key: "left", label: "左侧", lat: 0, lon: 170 },
  { key: "top", label: "顶部", lat: 90, lon: 0 },
  { key: "right", label: "右侧", lat: 0, lon: 10 },
  { key: "front", label: "前方", lat: 0, lon: 90 },
  { key: "bottom", label: "底部", lat: -90, lon: 0 },
  { key: "back", label: "后方", lat: 0, lon: -90 },
];

export default function LightSphereControls({
  config,
  colorTemperature,
  onChange,
  onColorTemperatureChange,
  activePosition,
  onPositionChange,
}: LightSphereControlsProps) {
  const brightness = Math.round(config.intensity * 100);
  const sliderBaseClass = [
    "h-[5px] w-full cursor-pointer appearance-none rounded-full outline-none",
    "[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer",
    "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white/85",
    "[&::-moz-range-thumb]:bg-[#f4f4f4] [&::-moz-range-thumb]:shadow-[0_1px_5px_rgba(0,0,0,0.42)]",
    "[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer",
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full",
    "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white/85 [&::-webkit-slider-thumb]:bg-[#f4f4f4]",
    "[&::-webkit-slider-thumb]:shadow-[0_1px_5px_rgba(0,0,0,0.42)]",
  ].join(" ");
  const sectionClass = "flex flex-col gap-2.5";
  const titleClass = "whitespace-nowrap text-base font-bold leading-none text-white/90";
  const readoutClass = "flex min-w-[68px] items-center justify-end gap-1.5 whitespace-nowrap text-[15px] font-bold text-white/90";

  const handleBrightnessChange = (value: number) => {
    onChange({ ...config, intensity: value / 100 });
  };

  const brightnessSliderStyle: SliderStyle = {
    "--slider-value": `${brightness}%`,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-8 items-center justify-between">
        <h2 className="m-0 text-xl font-extrabold leading-none tracking-normal text-white/90">全局</h2>
        <button
          className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-[28px] leading-none text-white/35 hover:text-white/70"
          type="button"
          aria-label="关闭面板"
        >
          ×
        </button>
      </div>

      <div className={sectionClass}>
        <span className={titleClass}>亮度</span>
        <div className="flex min-w-0 items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={brightness}
            onChange={(event) => handleBrightnessChange(Number(event.target.value))}
            className={`${sliderBaseClass} bg-[linear-gradient(to_right,rgba(255,255,255,0.34)_0_var(--slider-value),rgba(255,255,255,0.82)_var(--slider-value)_100%)]`}
            style={brightnessSliderStyle}
            aria-label="亮度"
          />
          <span className={readoutClass}>
            <span className="shrink-0 text-base font-medium text-white/40" aria-hidden="true">
              ☼
            </span>
            {brightness} %
          </span>
        </div>
      </div>

      <div className={sectionClass}>
        <span className={titleClass}>色温</span>
        <div className="flex min-w-0 items-center gap-3">
          <input
            type="range"
            min={2400}
            max={10000}
            step={100}
            value={colorTemperature}
            onChange={(event) => onColorTemperatureChange(Number(event.target.value))}
            className={`${sliderBaseClass} bg-[linear-gradient(to_right,#ff8d15_0%,#ffd7a5_34%,#ffffff_50%,#87adff_100%)]`}
            aria-label="色温"
          />
          <span className={`${readoutClass} min-w-[92px]`}>
            <span className="shrink-0 text-base font-medium text-white/40" aria-hidden="true">
              ♨
            </span>
            {colorTemperature} K
          </span>
        </div>
      </div>

      <div className={sectionClass}>
        <span className={titleClass}>主光源</span>
        <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
          {POSITIONS.map((pos) => (
            <button
              key={pos.key}
              className={[
                "min-h-8 cursor-pointer rounded-xl border-0 bg-transparent px-2 text-[15px] font-bold text-white/50",
                "transition-colors duration-150 hover:bg-white/[0.035] hover:text-white/85",
                activePosition === pos.key ? "bg-[#121212]/35 text-white/95" : "",
              ].join(" ")}
              onClick={() => onPositionChange(pos)}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { POSITIONS };
