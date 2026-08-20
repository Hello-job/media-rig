import {
  ArrowDown,
  ArrowUp,
  Crop,
  FlipHorizontal2,
  FlipVertical2,
  Lock,
  Maximize2,
  Minimize2,
  Trash2,
} from "lucide-react";
import type { EditorObject } from "../ImageEditor.types";
import type { ImageEditorActions } from "../hooks/useImageEditorController";
import ColorControl from "../controls/ColorControl";
import NumberControl from "../controls/NumberControl";

type SelectionToolbarProps = {
  selected: EditorObject[];
  actions: ImageEditorActions;
};

export default function SelectionToolbar({ selected, actions }: SelectionToolbarProps) {
  if (selected.length === 0) return null;
  const first = selected[0];
  const data = first.fabricData;
  return (
    <div className="image-editor__selection-toolbar" role="toolbar" aria-label="对象设置">
      {(first.type === "text" || first.type === "rect" || first.type === "ellipse") ? (
        <ColorControl
          label={first.type === "text" ? "文字颜色" : "填充颜色"}
          value={String(data.fill ?? "#111111")}
          onChange={(fill) => actions.updateSelection({ fill })}
        />
      ) : null}
      {first.type === "text" ? (
        <NumberControl
          label="字号"
          value={Number(data.fontSize ?? 48)}
          min={8}
          max={300}
          onChange={(fontSize) => actions.updateSelection({ fontSize })}
        />
      ) : null}
      <NumberControl
        label="透明度"
        value={Math.round(Number(data.opacity ?? 1) * 100)}
        min={0}
        max={100}
        onChange={(opacity) => actions.updateSelection({ opacity: opacity / 100 })}
      />
      {first.type === "image" ? (
        <>
          <Action label="裁剪" icon={Crop} onClick={actions.startCrop} />
          <Action label="适应画布" icon={Minimize2} onClick={() => actions.fitImage("contain")} />
          <Action label="填充画布" icon={Maximize2} onClick={() => actions.fitImage("cover")} />
          <Action label="水平翻转" icon={FlipHorizontal2} onClick={() => actions.flipImage("x")} />
          <Action label="垂直翻转" icon={FlipVertical2} onClick={() => actions.flipImage("y")} />
        </>
      ) : null}
      <span className="image-editor__toolbar-divider" />
      <Action label="上移一层" icon={ArrowUp} onClick={actions.bringForward} />
      <Action label="下移一层" icon={ArrowDown} onClick={actions.sendBackward} />
      <Action label="锁定" icon={Lock} onClick={actions.toggleLock} />
      <Action label="删除" icon={Trash2} onClick={actions.deleteSelection} />
    </div>
  );
}

function Action({ label, icon: Icon, onClick }: { label: string; icon: typeof Crop; onClick(): void }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick}>
      <Icon aria-hidden="true" size={18} />
    </button>
  );
}
