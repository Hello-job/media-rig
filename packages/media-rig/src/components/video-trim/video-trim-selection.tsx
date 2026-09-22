import { useRef, type PointerEvent, type KeyboardEvent } from "react";
import { useTrimLabels } from "./labels";
import {
  adjustVideoTrimRange,
  type VideoTrimHandle,
  type VideoTrimRange,
} from "./trim-range";

export function VideoTrimSelection({
  range,
  duration,
  snap,
  disabled,
  onChange,
  onDragStart,
  onDragEnd,
}: {
  range: VideoTrimRange;
  duration: number;
  snap: boolean;
  disabled: boolean;
  onChange: (range: VideoTrimRange, previewEnd?: boolean) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const t = useTrimLabels();
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    x: number;
    width: number;
    range: VideoTrimRange;
    handle: VideoTrimHandle;
  } | null>(null);
  const start = (
    event: PointerEvent<HTMLButtonElement>,
    handle: VideoTrimHandle,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const width = track.current?.getBoundingClientRect().width ?? 0;
    if (disabled || !width || event.button !== 0) return;
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      width,
      range: [...range],
      handle,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    onDragStart();
  };
  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId || disabled) return;
    onChange(
      adjustVideoTrimRange(
        current.range,
        current.handle,
        ((event.clientX - current.x) / current.width) * duration,
        duration,
        snap,
      ),
      current.handle === "end",
    );
  };
  const finish = () => {
    if (!drag.current) return;
    drag.current = null;
    onDragEnd();
  };
  const end = (event: PointerEvent<HTMLButtonElement>) => {
    finish();
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const key = (
    event: KeyboardEvent<HTMLButtonElement>,
    handle: VideoTrimHandle,
  ) => {
    if (disabled) return;
    const step = snap ? 1 : 0.01;
    let delta: number;
    if (event.key === "ArrowLeft") delta = -(event.shiftKey ? 1 : step);
    else if (event.key === "ArrowRight") delta = event.shiftKey ? 1 : step;
    else if (event.key === "Home") delta = -duration;
    else if (event.key === "End") delta = duration;
    else return;
    event.preventDefault();
    event.stopPropagation();
    onChange(
      adjustVideoTrimRange(range, handle, delta, duration, snap),
      handle === "end",
    );
  };
  return (
    <div ref={track} className="media-rig-trim__selection-track">
      <div
        className="media-rig-trim__selection"
        style={{
          left: `${(range[0] / duration) * 100}%`,
          width: `${((range[1] - range[0]) / duration) * 100}%`,
        }}
      >
        {/* One continuous border joins the rails and handles without overlapping fills. */}
        <div
          aria-hidden="true"
          className="media-rig-trim__selection-border"
        />
        <button type="button"
          disabled={disabled}
          aria-label={t("videoTrim.move")}
          className="media-rig-trim__move"
          onPointerDown={(event) => start(event, "move")}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onLostPointerCapture={finish}
          onKeyDown={(event) => key(event, "move")}
        >
          <span className="media-rig-trim__length">
            {t("videoTrim.seconds", {
              seconds: (range[1] - range[0]).toFixed(2),
            })}
          </span>
        </button>
        {(["start", "end"] as const).map((handle) => (
          <button type="button"
            key={handle}
            role="slider"
            aria-label={t(`videoTrim.${handle}`)}
            aria-valuemin={
              handle === "start" ? 0 : range[0] + Math.min(0.1, duration)
            }
            aria-valuemax={
              handle === "start" ? range[1] - Math.min(0.1, duration) : duration
            }
            aria-valuenow={handle === "start" ? range[0] : range[1]}
            disabled={disabled}
            className="media-rig-trim__handle"
            style={handle === "start" ? { left: -12 } : { right: -12 }}
            onPointerDown={(event) => start(event, handle)}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            onLostPointerCapture={finish}
            onKeyDown={(event) => key(event, handle)}
          >
            <span
              aria-hidden="true"
              className="media-rig-trim__grip"
            >
              <span className="media-rig-trim__grip-line" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
