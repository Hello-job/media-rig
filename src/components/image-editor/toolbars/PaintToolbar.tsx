import { Eraser, Paintbrush, Palette } from "lucide-react";
import type { ImageEditorState } from "../ImageEditor.types";
import type { ImageEditorActions } from "../hooks/useImageEditorController";

type PaintToolbarProps = {
  state: ImageEditorState;
  actions: ImageEditorActions;
};

export default function PaintToolbar({ state, actions }: PaintToolbarProps) {
  return (
    <div className="image-editor__paint-toolbar" role="toolbar" aria-label="绘色板设置">
      <button
        type="button"
        className={state.paintMode === "brush" ? "is-active" : undefined}
        aria-label="画笔"
        aria-pressed={state.paintMode === "brush"}
        title="画笔"
        onClick={() => actions.setPaintMode("brush")}
      >
        <Paintbrush size={22} />
      </button>
      <button
        type="button"
        className={state.paintMode === "eraser" ? "is-active" : undefined}
        aria-label="橡皮擦"
        aria-pressed={state.paintMode === "eraser"}
        title="橡皮擦（仅擦除手绘笔迹）"
        onClick={() => actions.setPaintMode("eraser")}
      >
        <Eraser size={22} />
      </button>
      <span className="image-editor__toolbar-divider" />
      <label className="image-editor__paint-color" title="画笔颜色">
        <Palette size={22} aria-hidden="true" />
        <input
          type="color"
          aria-label="画笔颜色"
          value={state.drawColor}
          onChange={(event) => actions.setDrawColor(event.target.value)}
        />
      </label>
    </div>
  );
}
