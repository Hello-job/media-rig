import {
  FlipHorizontal2,
  FlipVertical2,
  RotateCw,
} from "lucide-react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type {
  LayerSeparatorAsset,
  LayerSeparatorResult,
  LayerSeparatorTransform,
} from "../LayerSeparator.types";
import { normalizeTransform } from "../LayerSeparator.utils";

type CompositionStageProps = {
  result: LayerSeparatorResult;
  aspectRatio: number;
  backgroundLabel: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (id: string, transform: LayerSeparatorTransform) => void;
};

function layerFrame(layer: LayerSeparatorAsset) {
  const transform = normalizeTransform(layer.transform);
  const bounds = layer.contentBounds ?? { x: 0, y: 0, width: 1, height: 1 };
  return {
    x: transform.x + bounds.x * transform.width,
    y: transform.y + bounds.y * transform.height,
    width: bounds.width * transform.width,
    height: bounds.height * transform.height,
  };
}

export default function CompositionStage({
  result,
  aspectRatio,
  backgroundLabel,
  selectedId,
  onSelect,
  onChange,
}: CompositionStageProps) {
  const beginMove = (event: ReactPointerEvent, layer: LayerSeparatorAsset) => {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    const stage = target.closest<HTMLElement>(".layer-separator__composition-stage");
    if (!stage) return;
    const start = { x: event.clientX, y: event.clientY };
    const initial = normalizeTransform(layer.transform);
    onSelect(layer.id);

    const move = (pointerEvent: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      onChange(layer.id, {
        ...initial,
        x: initial.x + (pointerEvent.clientX - start.x) / rect.width,
        y: initial.y + (pointerEvent.clientY - start.y) / rect.height,
      });
    };
    const stop = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", stop);
      target.removeEventListener("pointercancel", stop);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", stop);
    target.addEventListener("pointercancel", stop);
  };

  return (
    <div
      className="layer-separator__stage layer-separator__composition-stage"
      style={{ aspectRatio }}
      onPointerDown={() => onSelect(null)}
    >
      <img className="layer-separator__background" src={result.background.url} alt="" draggable={false} />
      <span className="layer-separator__background-label">{backgroundLabel}</span>
      {result.layers.map((layer, index) => {
        const transform = normalizeTransform(layer.transform);
        const bounds = layer.contentBounds ?? { x: 0, y: 0, width: 1, height: 1 };
        const frame = layerFrame(layer);
        if (!transform.visible) return null;
        const selected = selectedId === layer.id;
        return (
          <div key={layer.id}>
            <div
              className="layer-separator__layer-image"
              style={{
                left: `${transform.x * 100}%`,
                top: `${transform.y * 100}%`,
                width: `${transform.width * 100}%`,
                height: `${transform.height * 100}%`,
                transform: `rotate(${transform.rotation}deg)`,
                transformOrigin: `${(bounds.x + bounds.width / 2) * 100}% ${(bounds.y + bounds.height / 2) * 100}%`,
              }}
            >
              <img
                src={layer.url}
                alt=""
                draggable={false}
                style={{ transform: `scale(${transform.flipX ? -1 : 1}, ${transform.flipY ? -1 : 1})` }}
              />
            </div>
            <button
              type="button"
              className={["layer-separator__layer-hitbox", selected ? "is-selected" : ""].join(" ")}
              style={{
                left: `${frame.x * 100}%`,
                top: `${frame.y * 100}%`,
                width: `${frame.width * 100}%`,
                height: `${frame.height * 100}%`,
                transform: `rotate(${transform.rotation}deg)`,
              }}
              aria-label={layer.name ?? `Layer ${index + 1}`}
              onPointerDown={(event) => beginMove(event, layer)}
            />
            {selected ? (
              <div
                className="layer-separator__object-toolbar"
                style={{
                  left: `${(frame.x + frame.width / 2) * 100}%`,
                  top: `${frame.y * 100}%`,
                }}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <button type="button" aria-label="Rotate layer" onClick={() => onChange(layer.id, { ...transform, rotation: (transform.rotation + 90) % 360 })}><RotateCw size={15} /></button>
                <button type="button" aria-label="Flip layer horizontally" onClick={() => onChange(layer.id, { ...transform, flipX: !transform.flipX })}><FlipHorizontal2 size={15} /></button>
                <button type="button" aria-label="Flip layer vertically" onClick={() => onChange(layer.id, { ...transform, flipY: !transform.flipY })}><FlipVertical2 size={15} /></button>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
