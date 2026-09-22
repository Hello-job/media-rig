import { RangeSlider } from "../motion/range-slider";
import { Button } from "../motion/button/base";
import { useCallback, useState, type CSSProperties, type ReactNode } from "react";
import { Brush, MousePointer2, Redo2, Square, Type, Undo2, X, Trash2, RotateCcw, LoaderCircle } from "lucide-react";
import { useAnnotationController } from "./useAnnotationController";
import { composeImageWithAnnotation } from "./compose";
import "./ImageAnnotation.css";

export interface ImageAnnotationProps {
  imageUrl: string;
  imageAlt?: string;
  /** Placeholder ratio before the image loads; the natural image ratio wins. */
  aspectRatio?: number;
  onSave?: (image: Blob) => void | Promise<void>;
  onCancel?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: CSSProperties;
}

export default function ImageAnnotation(props: ImageAnnotationProps) {
  // A new source owns a fresh canvas, history and loading state.
  return <AnnotationWorkspace key={props.imageUrl} {...props} />;
}

function AnnotationWorkspace({ imageUrl, imageAlt = "待涂鸦图片", aspectRatio = 3 / 2, onSave, onCancel, onError, className, style }: ImageAnnotationProps) {
  const [ratio, setRatio] = useState(aspectRatio > 0 ? aspectRatio : 3 / 2);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const reportError = useCallback((failure: Error) => { setError(failure.message); onError?.(failure); }, [onError]);
  const controller = useAnnotationController({ open: loaded, sourceImageUrl: imageUrl, onError: reportError, disabled: saving });
  const busy = saving || controller.restoring;
  const save = async () => {
    if (busy || !controller.ready || !onSave) return;
    const overlay = controller.exportOverlayCanvas();
    if (!overlay) return;
    setSaving(true);
    setError(null);
    try { await onSave(await composeImageWithAnnotation(imageUrl, overlay)); }
    catch (failure) { reportError(failure instanceof Error ? failure : new Error(String(failure))); }
    finally { setSaving(false); }
  };
  const button = (label: string, icon: ReactNode, action: () => void, active?: boolean, disabled = false) => (
    <Button variant="ghost" size="icon" type="button" title={label} aria-label={label} aria-pressed={active} disabled={busy || disabled} onClick={action}>{icon}</Button>
  );
  return (
    <section className={`image-annotation ${className ?? ""}`} style={style} aria-label="图片涂鸦" tabIndex={0}
      onPointerDownCapture={(event) => { if (!(event.target as HTMLElement).closest("button, input, textarea")) event.currentTarget.focus({ preventScroll: true }); }}
      onKeyDown={(event) => { if (event.key === "Escape" && !controller.isEditingText() && !busy) onCancel?.(); }}>
      <div className="image-annotation__toolbar" role="toolbar" aria-label="涂鸦工具">
        {onCancel && button("退出标注", <X size={16} />, onCancel)}
        {button("选择和移动", <MousePointer2 size={16} />, () => controller.setTool("select"), controller.tool === "select", !controller.ready)}
        {button("画笔", <Brush size={16} />, () => controller.setTool("brush"), controller.tool === "brush", !controller.ready)}
        {button("矩形", <Square size={16} />, () => controller.setTool("rect"), controller.tool === "rect", !controller.ready)}
        {button("文字", <Type size={16} />, () => controller.setTool("text"), controller.tool === "text", !controller.ready)}
        <span className="image-annotation__divider" />
        <input type="color" aria-label="标注颜色" value={controller.color} disabled={busy} onChange={(event) => controller.setColor(event.target.value)} />
        <label className="image-annotation__width">粗细<RangeSlider className="h-7 w-24" showTicks={false} min={1} max={24} aria-label="线条粗细" value={controller.strokeWidth} disabled={busy} onValueChange={controller.setStrokeWidth} /><output>{controller.strokeWidth}</output></label>
        <span className="image-annotation__divider" />
        {button("撤销", <Undo2 size={16} />, controller.undo, undefined, !controller.canUndo)}
        {button("重做", <Redo2 size={16} />, controller.redo, undefined, !controller.canRedo)}
        {button("删除所选", <Trash2 size={16} />, controller.deleteSelected, undefined, !controller.hasAnnotations)}
        {button("清空标注", <RotateCcw size={16} />, controller.reset, undefined, !controller.hasAnnotations)}
        <Button variant="ghost" size="icon" className="image-annotation__save" type="button" disabled={busy || !controller.ready || !controller.hasAnnotations || !onSave} onClick={() => void save()}>{saving ? <><LoaderCircle size={14} className="image-annotation__spinner" />保存中…</> : "保存"}</Button>
      </div>
      <div className="image-annotation__image" ref={controller.containerRef} style={{ aspectRatio: ratio }}>
        <img src={imageUrl} alt={imageAlt} draggable={false} onLoad={(event) => { setRatio(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight); setLoaded(true); }} onError={() => reportError(new Error("图片加载失败，请检查图片地址"))} />
        <canvas ref={controller.canvasRef} />
        {(!controller.ready || busy) && <div className="image-annotation__loading" role="status">{error ? "图片暂不可用" : saving ? "正在保存…" : controller.restoring ? "正在恢复…" : "正在准备标注工具…"}</div>}
      </div>
      {error && <p className="image-annotation__error" role="alert">{error}</p>}
      <p className="image-annotation__hint">画笔自由涂鸦 · 拖拽绘制矩形 · 点击添加文字 · 选择后移动、缩放和旋转 · ⌘ / Ctrl Z 撤销</p>
    </section>
  );
}
