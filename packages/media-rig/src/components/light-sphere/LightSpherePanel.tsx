import { Button } from "../motion/button/base";
import React, { useMemo, useRef, useState } from "react";
import { ArrowUp, LoaderCircle, RotateCcw } from "lucide-react";
import { BEAM_CONFIG, DEFAULT_LIGHT_SPHERE_PANEL_VALUE, LIGHT_POSITION_PRESETS, SPHERE_RADIUS } from "./LightSphere.constants";
import type { LightSphereActionButtonProps, LightSpherePanelProps, LightSpherePanelValue } from "./LightSphere.types";
import { colorTemperatureToHex } from "./utils/color-temperature";
import { sphericalPoint } from "./utils/geometry";
import { resolveLightPositionPresetKey } from "./utils/position-preset";
import { LightingControls } from "./parts/LightingControls";
import LightSphere from "./LightSphere";

function normalizeValue(value?: Partial<LightSpherePanelValue>): LightSpherePanelValue {
  const preset = LIGHT_POSITION_PRESETS.find(({ key }) => key === value?.activePosition);
  const point = value?.position ?? (preset ? sphericalPoint(preset.lat, preset.lon, SPHERE_RADIUS) : DEFAULT_LIGHT_SPHERE_PANEL_VALUE.position);
  return {
    ...DEFAULT_LIGHT_SPHERE_PANEL_VALUE,
    ...value,
    position: value?.position ?? { x: point.x, y: point.y, z: point.z },
    activePosition: resolveLightPositionPresetKey(point),
    intensity: Math.min(1, Math.max(0, value?.intensity ?? 0.5)),
    colorTemperature: Math.min(10000, Math.max(2400, value?.colorTemperature ?? 5600)),
  };
}

function DefaultActionButton({ className, onClick, disabled, loading }: LightSphereActionButtonProps) {
  return (
    <Button variant="ghost" size="icon" type="button" className={className} onClick={onClick} disabled={disabled} aria-busy={loading} aria-label={loading ? "处理中" : "应用打光"} title={loading ? "处理中" : "应用打光"}>
      {loading ? <LoaderCircle size={14} className="animate-spin" aria-hidden="true" /> : <ArrowUp size={16} aria-hidden="true" />}
    </Button>
  );
}

export default function LightSpherePanel({
  imageUrl = "/assets/photo-texture2.png", value, defaultValue, onChange, onChangeEnd, onClose,
  actionButton: ActionButton = DefaultActionButton, actionInput, actionLoading = false, actionDisabled = false,
  onAction, className = "", style,
}: LightSpherePanelProps) {
  const [internalValue, setInternalValue] = useState(() => normalizeValue(defaultValue));
  const currentValue = useMemo(() => value === undefined ? internalValue : normalizeValue(value), [value, internalValue]);
  const latestValue = useRef(currentValue);
  latestValue.current = currentValue;
  const pending = useRef(false);

  const update = (patch: Partial<LightSpherePanelValue>, commit = true) => {
    const next = { ...latestValue.current, ...patch };
    latestValue.current = next;
    if (value === undefined) setInternalValue(next);
    onChange?.(next);
    pending.current = !commit;
    if (commit) onChangeEnd?.(next);
  };

  const commit = () => {
    if (!pending.current) return;
    pending.current = false;
    onChangeEnd?.(latestValue.current);
  };

  return (
    <section
      data-slot="light-sphere-panel"
      aria-label="3D 打光"
      className={`nodrag h-[320px] w-[560px] max-w-full overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#191919] font-sans text-white shadow-[0_22px_70px_rgba(0,0,0,0.56)] max-[480px]:h-auto ${className}`}
      style={style}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,300fr)_minmax(220px,260fr)] max-[480px]:grid-cols-1">
        <div className="relative min-w-0 overflow-hidden bg-[#20201f] max-[480px]:h-[300px]">
          <div className="absolute left-1/2 top-3 z-[4] grid h-7 w-[88px] -translate-x-1/2 grid-cols-2 gap-0.5 rounded-[9px] bg-black/20 p-1" aria-label="预览视角">
            {(["perspective", "front"] as const).map((mode) => (
              <Button variant="ghost" size="icon"
                key={mode}
                type="button"
                aria-pressed={currentValue.viewMode === mode}
                className={`size-full p-0 cursor-pointer rounded-[7px] border-0 text-[10px] font-semibold leading-none transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/25 ${currentValue.viewMode === mode ? "bg-white/15 text-white/90" : "bg-transparent text-white/35"}`}
                onClick={() => update({ viewMode: mode })}
              >
                {mode === "perspective" ? "透视" : "正面"}
              </Button>
            ))}
          </div>
          <div className="absolute left-1/2 top-[48px] size-[200px] -translate-x-1/2 overflow-hidden rounded-full [&_canvas]:touch-none">
            <LightSphere
              imageUrl={imageUrl}
              {...BEAM_CONFIG}
              color={colorTemperatureToHex(currentValue.colorTemperature)}
              intensity={currentValue.intensity}
              sphereRadius={SPHERE_RADIUS}
              viewMode={currentValue.viewMode}
              targetPosition={currentValue.position}
              onLightSettle={(position) => {
                const current = latestValue.current;
                const activePosition = resolveLightPositionPresetKey(position);
                if (Math.abs(position.x - current.position.x) < 0.002 && Math.abs(position.y - current.position.y) < 0.002 && Math.abs(position.z - current.position.z) < 0.002 && activePosition === current.activePosition) return;
                update({ position, activePosition });
              }}
            />
          </div>
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center">
            <span className="rounded-t-[9px] border border-white/[0.08] bg-black/20 px-4 py-1 text-[10px] font-semibold italic text-white/55">主光源</span>
            <Button variant="ghost" size="icon"
              type="button"
              aria-label="重置打光"
              className="absolute right-3 inline-flex h-auto w-auto whitespace-nowrap cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-white/30 transition-colors hover:bg-white/5 hover:text-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
              onClick={() => update(normalizeValue())}
            >
              <RotateCcw size={12} aria-hidden="true" />重置
            </Button>
          </div>
        </div>
        <aside className="flex min-h-0 min-w-0 flex-col border-l border-white/[0.06] bg-[#191919] px-3 pb-2.5 pt-2.5 max-[480px]:border-l-0 max-[480px]:border-t">
          <LightingControls
            values={currentValue}
            onBrightnessChange={(intensity) => update({ intensity }, false)}
            onColorTemperatureChange={(colorTemperature) => update({ colorTemperature }, false)}
            onPositionChange={(key) => {
              const preset = LIGHT_POSITION_PRESETS.find((item) => item.key === key);
              if (!preset) return;
              const point = sphericalPoint(preset.lat, preset.lon, SPHERE_RADIUS);
              update({ activePosition: key, position: { x: point.x, y: point.y, z: point.z } });
            }}
            onRimLightChange={(rimLightEnabled) => update({ rimLightEnabled })}
            onClose={onClose}
            onInteractionEnd={commit}
          />
          <div className="mt-auto flex justify-end pt-1.5">
            <ActionButton
              className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white p-0 text-black shadow-sm transition-colors hover:bg-white/85 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              value={currentValue}
              input={actionInput}
              loading={actionLoading}
              disabled={actionLoading || actionDisabled}
              onClick={(event) => {
                if (!actionLoading && !actionDisabled) onAction?.({ value: latestValue.current, input: actionInput }, event);
              }}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
