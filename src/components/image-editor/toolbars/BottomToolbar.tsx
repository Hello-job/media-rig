import {
  Circle,
  Expand,
  ImagePlus,
  Layers3,
  Minus,
  MousePointer2,
  Palette,
  Redo2,
  RectangleHorizontal,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
  MoveUpRight,
} from "lucide-react";
import type { ImageEditorState, ImageEditorTool } from "../ImageEditor.types";
import type { ImageEditorActions } from "../hooks/useImageEditorController";

type BottomToolbarProps = {
  state: ImageEditorState;
  actions: ImageEditorActions;
  onChooseImage(): void;
  onToggleFullscreen(): void;
};

export default function BottomToolbar({
  state,
  actions,
  onChooseImage,
  onToggleFullscreen,
}: BottomToolbarProps) {
  return (
    <div className="image-editor__bottom-toolbar" role="toolbar" aria-label="编辑工具">
      <ToolButton label="选择工具" icon={MousePointer2} active={state.activeTool === "select"} onClick={() => actions.setTool("select")} />
      <ToolButton label="矩形" icon={RectangleHorizontal} active={state.activeTool === "rect"} onClick={() => actions.addRect()} />
      <ToolButton label="椭圆" icon={Circle} active={state.activeTool === "ellipse"} onClick={() => actions.addEllipse()} />
      <ToolButton label="直线" icon={Minus} active={state.activeTool === "line"} onClick={() => actions.addLine()} />
      <ToolButton label="箭头" icon={MoveUpRight} active={state.activeTool === "arrow"} onClick={() => actions.setTool("arrow")} />
      <ToolButton label="绘色板" icon={Palette} active={state.activeTool === "draw"} onClick={() => actions.setTool("draw")} />
      <ToolButton label="添加文本" icon={Type} onClick={() => actions.addText()} />
      <ToolButton label="添加图片" icon={ImagePlus} onClick={onChooseImage} />
      <span className="image-editor__toolbar-divider" />
      <ToolButton label="图层" icon={Layers3} active={state.layersOpen} onClick={actions.toggleLayers} />
      <ToolButton label="撤销" icon={Undo2} disabled={!state.canUndo} onClick={actions.undo} />
      <ToolButton label="重做" icon={Redo2} disabled={!state.canRedo} onClick={actions.redo} />
      <ToolButton label="缩小" icon={ZoomOut} onClick={() => actions.setZoom(state.zoom - 0.1)} />
      <span className="image-editor__zoom-value">{Math.round(state.zoom * 100)}%</span>
      <ToolButton label="放大" icon={ZoomIn} onClick={() => actions.setZoom(state.zoom + 0.1)} />
      <ToolButton label="适应窗口" icon={Expand} onClick={actions.fitToViewport} />
      <ToolButton label="全屏" icon={Expand} onClick={onToggleFullscreen} />
    </div>
  );
}

type ToolButtonProps = {
  label: string;
  icon: typeof MousePointer2;
  active?: boolean;
  disabled?: boolean;
  onClick(): void;
};

function ToolButton({ label, icon: Icon, active, disabled, onClick }: ToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={active ? "is-active" : undefined}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon aria-hidden="true" size={20} />
    </button>
  );
}
