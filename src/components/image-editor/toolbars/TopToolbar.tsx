import { CircleOff, Download, FilePlus2, Save, SlidersHorizontal, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ASPECT_RATIO_OPTIONS } from "../ImageEditor.constants";
import type { ImageEditorDocument } from "../ImageEditor.types";
import type { ImageEditorActions } from "../hooks/useImageEditorController";
import ColorControl from "../controls/ColorControl";

type TopToolbarProps = {
  document: ImageEditorDocument;
  actions: ImageEditorActions;
  onClose?: () => void;
};

export default function TopToolbar({ document, actions, onClose }: TopToolbarProps) {
  const [ratio, setRatio] = useState("custom");
  const [dimensionsOpen, setDimensionsOpen] = useState(false);
  const applyRatio = (id: string) => {
    setRatio(id);
    const option = ASPECT_RATIO_OPTIONS.find((candidate) => candidate.id === id);
    if (option?.value) {
      actions.setCanvasSize(document.canvas.width, Math.round(document.canvas.width / option.value));
    }
  };
  return (
    <header className="image-editor__topbar" role="toolbar" aria-label="画布设置">
      <div className="image-editor__canvas-controls">
        <select aria-label="画布比例" value={ratio} onChange={(event) => applyRatio(event.target.value)}>
          {ASPECT_RATIO_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
        <button
          type="button"
          aria-label="自定义画布尺寸"
          aria-pressed={dimensionsOpen}
          title="自定义画布尺寸"
          onClick={() => setDimensionsOpen((open) => !open)}
        ><SlidersHorizontal size={18} /></button>
        {dimensionsOpen ? (
          <div className="image-editor__dimension-popover">
            <label className="image-editor__dimension">
              <span>宽</span>
              <input
                aria-label="画布宽度"
                type="number"
                min={1}
                value={document.canvas.width}
                onChange={(event) => actions.setCanvasSize(Number(event.target.value), document.canvas.height)}
              />
            </label>
            <span className="image-editor__dimension-separator">×</span>
            <label className="image-editor__dimension">
              <span>高</span>
              <input
                aria-label="画布高度"
                type="number"
                min={1}
                value={document.canvas.height}
                onChange={(event) => actions.setCanvasSize(document.canvas.width, Number(event.target.value))}
              />
            </label>
          </div>
        ) : null}
        <ColorControl
          label="画布背景色"
          value={document.canvas.background ?? "#ffffff"}
          onChange={actions.setBackground}
        />
        <button type="button" aria-label="透明背景" title="透明背景" onClick={() => actions.setBackground(null)}>
          <CircleOff size={18} />
        </button>
      </div>
      <div className="image-editor__top-actions">
        <IconButton label="新建" icon={FilePlus2} onClick={() => void actions.newDocument()} />
        <IconButton label="清空画布" icon={Trash2} onClick={actions.clearDocument} />
        <IconButton label="保存" icon={Save} onClick={actions.save} />
        <IconButton
          label="下载图片"
          icon={Download}
          onClick={() => void actions.exportImage({ format: "png", transparent: true, download: true })}
        />
        <IconButton label="关闭" icon={X} onClick={onClose} disabled={!onClose} />
      </div>
    </header>
  );
}

type IconButtonProps = {
  label: string;
  icon: typeof Save;
  onClick?: () => void;
  disabled?: boolean;
};

function IconButton({ label, icon: Icon, onClick, disabled }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled}>
      <Icon aria-hidden="true" size={19} />
    </button>
  );
}
