import { RangeSlider } from "../../motion/range-slider";
import { Button } from "../../motion/button/base";
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
      <Button variant="ghost" size="icon"
        type="button"
        className={state.paintMode === "brush" ? "is-active" : undefined}
        aria-label="画笔"
        aria-pressed={state.paintMode === "brush"}
        title="画笔"
        onClick={() => actions.setPaintMode("brush")}
      >
        <Paintbrush size={22} />
      </Button>
      <Button variant="ghost" size="icon"
        type="button"
        className={state.paintMode === "eraser" ? "is-active" : undefined}
        aria-label="橡皮擦"
        aria-pressed={state.paintMode === "eraser"}
        title="橡皮擦（仅擦除手绘笔迹）"
        onClick={() => actions.setPaintMode("eraser")}
      >
        <Eraser size={22} />
      </Button>
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
      <div className="image-editor__paint-settings" role="group" aria-label="画笔参数">
        <label>
          <span>画笔宽度</span>
          <output>{state.drawWidth}px</output>
          <RangeSlider
            className="col-span-full h-7" showTicks={false}
            aria-label="画笔大小"
            min={1}
            max={40}
            value={state.drawWidth}
            onValueChange={actions.setDrawWidth}
          />
        </label>
        <label>
          <span>不透明度</span>
          <output>{Math.round(state.drawOpacity * 100)}%</output>
          <RangeSlider
            className="col-span-full h-7" showTicks={false}
            aria-label="画笔不透明度"
            min={10}
            max={100}
            value={Math.round(state.drawOpacity * 100)}
            onValueChange={value => actions.setDrawOpacity(value / 100)}
          />
        </label>
      </div>
    </div>
  );
}
