import React, { useState } from "react";
import {
  BEAM_CONFIG,
  LightSphere,
  type LightSphereViewMode,
  SPHERE_RADIUS,
  sphericalPoint,
  type LightSphereConfig,
  type Vector3Like,
} from "../../index";
import LightSphereControls, { POSITIONS, type LightPositionPreset } from "../components/LightSphereControls";

const DEFAULT_TEMPERATURE = 5600;
const DEFAULT_LIGHT_PRESET = POSITIONS.find((position) => position.key === "front") ?? POSITIONS[0];

function colorTemperatureToHex(kelvin: number) {
  const temperature = kelvin / 100;
  let red: number;
  let green: number;
  let blue: number;

  if (temperature <= 66) {
    red = 255;
    green = 99.4708025861 * Math.log(temperature) - 161.1195681661;
    blue = temperature <= 19 ? 0 : 138.5177312231 * Math.log(temperature - 10) - 305.0447927307;
  } else {
    red = 329.698727446 * Math.pow(temperature - 60, -0.1332047592);
    green = 288.1221695283 * Math.pow(temperature - 60, -0.0755148492);
    blue = 255;
  }

  const channelToHex = (channel: number) =>
    Math.min(255, Math.max(0, Math.round(channel))).toString(16).padStart(2, "0");

  return `#${channelToHex(red)}${channelToHex(green)}${channelToHex(blue)}`;
}

const DEFAULT_CONFIG: LightSphereConfig = {
  color: colorTemperatureToHex(DEFAULT_TEMPERATURE),
  spread: BEAM_CONFIG.spread,
  intensity: 0.5,
  glowRadius: BEAM_CONFIG.glowRadius,
  glowIntensity: BEAM_CONFIG.glowIntensity,
  baseLineOpacity: BEAM_CONFIG.baseLineOpacity,
  sphereRadius: SPHERE_RADIUS,
};

export default function LightSpherePreview() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [viewMode, setViewMode] = useState<LightSphereViewMode>("front");
  const [colorTemperature, setColorTemperature] = useState(DEFAULT_TEMPERATURE);
  const [activePosition, setActivePosition] = useState(DEFAULT_LIGHT_PRESET.key);
  const [targetPosition, setTargetPosition] = useState<Vector3Like | null>(() => {
    const point = sphericalPoint(DEFAULT_LIGHT_PRESET.lat, DEFAULT_LIGHT_PRESET.lon, DEFAULT_CONFIG.sphereRadius);
    return { x: point.x, y: point.y, z: point.z };
  });

  const handleConfigChange = (nextConfig: LightSphereConfig) => {
    setConfig(nextConfig);
  };

  const handleColorTemperatureChange = (temperature: number) => {
    setColorTemperature(temperature);
    setConfig((currentConfig) => ({
      ...currentConfig,
      color: colorTemperatureToHex(temperature),
    }));
  };

  const handlePositionChange = (pos: LightPositionPreset) => {
    setActivePosition(pos.key);
    const point = sphericalPoint(pos.lat, pos.lon, config.sphereRadius);
    setTargetPosition({ x: point.x, y: point.y, z: point.z });
  };

  const viewButtonClass = (mode: LightSphereViewMode) =>
    [
      "cursor-pointer rounded-xl border-0 bg-transparent text-[18px] font-bold leading-none tracking-normal",
      "text-white/40 focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-4 focus-visible:outline-white/20",
      viewMode === mode ? "bg-white/10 text-white/85" : "",
    ].join(" ");

  return (
    <div className="grid h-full min-h-0 w-full grid-cols-[1fr_300px] bg-[#141414] max-[720px]:grid-cols-1 max-[720px]:grid-rows-[1fr_auto]">
      <div className="relative overflow-hidden">
        <div
          className="absolute left-1/2 top-4 z-[4] grid h-14 w-[min(230px,calc(100%-32px))] -translate-x-1/2 grid-cols-2 gap-1.5 rounded-2xl border border-white/[0.08] bg-[#1c1c1c]/90 p-1.5"
          aria-label="预览视角"
        >
          <button
            type="button"
            className={viewButtonClass("perspective")}
            onClick={() => setViewMode("perspective")}
          >
            透视
          </button>
          <button
            type="button"
            className={viewButtonClass("front")}
            onClick={() => setViewMode("front")}
          >
            正面
          </button>
        </div>
        <LightSphere
          imageUrl="/assets/photo-texture2.png"
          {...config}
          viewMode={viewMode}
          targetPosition={targetPosition}
        />
      </div>
      <aside className="flex flex-col overflow-y-auto border-l border-white/[0.06] bg-[#1d1d1d] px-5 pb-5 pt-3 max-[720px]:max-h-[38vh] max-[720px]:border-l-0 max-[720px]:border-t max-[720px]:border-white/[0.06]">
        <LightSphereControls
          config={config}
          colorTemperature={colorTemperature}
          onChange={handleConfigChange}
          onColorTemperatureChange={handleColorTemperatureChange}
          activePosition={activePosition}
          onPositionChange={handlePositionChange}
        />
      </aside>
    </div>
  );
}
