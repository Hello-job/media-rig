import { Check, FolderOpen, Layers3, Shapes, Type, X } from "lucide-react";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import type { ImageEditorHandle, ImageEditorProps } from "./ImageEditor.types";
import { useEditorKeyboard } from "./hooks/useEditorKeyboard";
import { useImageEditorController } from "./hooks/useImageEditorController";
import LayersPanel from "./panels/LayersPanel";
import BottomToolbar from "./toolbars/BottomToolbar";
import PaintToolbar from "./toolbars/PaintToolbar";
import SelectionToolbar from "./toolbars/SelectionToolbar";
import TopToolbar from "./toolbars/TopToolbar";
import "./ImageEditor.css";

const ImageEditor = forwardRef<ImageEditorHandle, ImageEditorProps>(function ImageEditor(
  props,
  ref,
) {
  const rootRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropPointerRef = useRef<{ x: number; y: number } | null>(null);
  const controller = useImageEditorController(props);
  const { actions, document: editorDocument, state } = controller;
  useEditorKeyboard(rootRef, controller.canvas, actions);

  useImperativeHandle(
    ref,
    () => ({
      addImage: actions.addImage,
      addText: actions.addText,
      loadDocument: actions.loadDocument,
      getDocument: () => structuredClone(editorDocument),
      undo: actions.undo,
      redo: actions.redo,
      fitToViewport: actions.fitToViewport,
      exportImage: actions.exportImage,
    }),
    [actions, editorDocument],
  );

  const importFiles = (files: FileList | File[]) => {
    const file = files[0];
    if (file) void actions.addImage(file);
  };

  const toggleFullscreen = async () => {
    const root = rootRef.current;
    if (!root) return;
    if (globalThis.document.fullscreenElement) await globalThis.document.exitFullscreen();
    else await root.requestFullscreen();
  };

  return (
    <section
      ref={rootRef}
      className={["image-editor", props.className].filter(Boolean).join(" ")}
      style={props.style}
      role="application"
      aria-label="图片编辑器"
      tabIndex={-1}
    >
      <TopToolbar document={controller.document} actions={actions} onClose={props.onClose} />
      <aside className="image-editor__left-rail" aria-label="素材和图层">
        <button type="button" aria-label="图片素材" title="图片素材" onClick={() => fileInputRef.current?.click()}><FolderOpen size={21} /></button>
        <button type="button" aria-label="图层面板" title="图层面板" onClick={actions.toggleLayers}><Layers3 size={21} /></button>
        <button type="button" aria-label="添加图形" title="添加图形" onClick={actions.addRect}><Shapes size={21} /></button>
        <button type="button" aria-label="添加文本图层" title="添加文本图层" onClick={() => actions.addText()}><Type size={21} /></button>
      </aside>
      <LayersPanel
        open={state.layersOpen}
        document={controller.document}
        selectedIds={state.selectedIds}
        actions={actions}
      />
      <main
        ref={controller.viewportRef}
        className="image-editor__workspace"
        data-testid="image-editor-workspace"
        tabIndex={0}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          importFiles(event.dataTransfer.files);
        }}
        onPaste={(event) => {
          const file = [...event.clipboardData.items]
            .find((item) => item.kind === "file")
            ?.getAsFile();
          if (file) void actions.addImage(file);
        }}
        onPointerDown={(event) => {
          if (state.activeTool === "crop") {
            cropPointerRef.current = { x: event.clientX, y: event.clientY };
            event.currentTarget.setPointerCapture?.(event.pointerId);
          }
        }}
        onPointerMove={(event) => {
          const last = cropPointerRef.current;
          if (!last || state.activeTool !== "crop") return;
          actions.panCrop(
            (event.clientX - last.x) / state.zoom,
            (event.clientY - last.y) / state.zoom,
          );
          cropPointerRef.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={() => {
          cropPointerRef.current = null;
        }}
      >
        <div
          className="image-editor__canvas-stage"
          style={{
            width: controller.document.canvas.width,
            height: controller.document.canvas.height,
            transform: `scale(${state.zoom})`,
          }}
        >
          <canvas ref={controller.canvasElementRef} aria-label="编辑画布" />
        </div>
      </main>
      <SelectionToolbar selected={controller.selectedObjects} actions={actions} />
      {state.activeTool === "draw" ? <PaintToolbar state={state} actions={actions} /> : null}
      {state.activeTool === "crop" ? (
        <div className="image-editor__crop-toolbar" role="toolbar" aria-label="裁剪设置">
          <span>拖动图片调整裁剪区域</span>
          <button type="button" aria-label="确认裁剪" onClick={actions.confirmCrop}><Check size={18} /></button>
          <button type="button" aria-label="取消裁剪" onClick={actions.cancelCrop}><X size={18} /></button>
        </div>
      ) : null}
      <BottomToolbar
        state={state}
        actions={actions}
        onChooseImage={() => fileInputRef.current?.click()}
        onToggleFullscreen={() => void toggleFullscreen()}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(event) => {
          if (event.target.files) importFiles(event.target.files);
          event.target.value = "";
        }}
      />
      {state.isLoading ? <div className="image-editor__busy" role="status">正在处理…</div> : null}
      <div className="image-editor__announcer" aria-live="polite">
        {state.isDirty ? "画布已修改" : "画布已保存"}
      </div>
    </section>
  );
});

export default ImageEditor;
