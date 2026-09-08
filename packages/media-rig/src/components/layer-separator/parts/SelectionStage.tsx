import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import type { LayerSeparatorSelection } from "../LayerSeparator.types";

type SelectionStageProps = {
  stageRef: RefObject<HTMLDivElement | null>;
  imageUrl: string;
  imageAlt: string;
  aspectRatio: number;
  selections: LayerSeparatorSelection[];
  draft: LayerSeparatorSelection | null;
  hint: string;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerCancel: () => void;
};

export default function SelectionStage({
  stageRef,
  imageUrl,
  imageAlt,
  aspectRatio,
  selections,
  draft,
  hint,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: SelectionStageProps) {
  return (
    <div
      ref={stageRef}
      className="layer-separator__stage layer-separator__selection-stage"
      style={{ aspectRatio }}
    >
      <img src={imageUrl} alt={imageAlt} draggable={false} />
      <div
        className="layer-separator__selection-surface"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {[...selections, ...(draft ? [draft] : [])].map((selection, index) => {
          const left = Math.min(selection.x1, selection.x2);
          const top = Math.min(selection.y1, selection.y2);
          const width = Math.abs(selection.x2 - selection.x1);
          const height = Math.abs(selection.y2 - selection.y1);
          return (
            <div
              key={selection.id}
              className="layer-separator__selection-box"
              style={{
                left: `${left * 100}%`,
                top: `${top * 100}%`,
                width: `${width * 100}%`,
                height: `${height * 100}%`,
              }}
            >
              <span className="layer-separator__selection-number">{index + 1}</span>
              <i data-corner="tl" /><i data-corner="tr" />
              <i data-corner="bl" /><i data-corner="br" />
            </div>
          );
        })}
        {selections.length === 0 && !draft ? (
          <p className="layer-separator__selection-hint">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
