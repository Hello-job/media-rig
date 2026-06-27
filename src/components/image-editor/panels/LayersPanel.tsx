import { Eye, EyeOff, Lock, Unlock } from "lucide-react";
import type { ImageEditorDocument } from "../ImageEditor.types";
import type { ImageEditorActions } from "../hooks/useImageEditorController";

type LayersPanelProps = {
  open: boolean;
  document: ImageEditorDocument;
  selectedIds: string[];
  actions: ImageEditorActions;
};

export default function LayersPanel({ open, document, selectedIds, actions }: LayersPanelProps) {
  if (!open) return null;
  return (
    <section className="image-editor__layers-panel" aria-label="图层面板">
      <div className="image-editor__panel-title">图层</div>
      <div className="image-editor__layer-list">
        {[...document.objects].reverse().map((object) => (
          <div key={object.id} className={selectedIds.includes(object.id) ? "is-selected" : undefined}>
            <button type="button" className="image-editor__layer-name" onClick={() => actions.selectObject(object.id)}>
              <span>{object.name}</span>
              <small>{object.type}</small>
            </button>
            <button type="button" aria-label={object.visible ? `隐藏 ${object.name}` : `显示 ${object.name}`} onClick={() => {
              actions.selectObject(object.id);
              actions.toggleVisibility();
            }}>
              {object.visible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button type="button" aria-label={object.locked ? `解锁 ${object.name}` : `锁定 ${object.name}`} onClick={() => {
              actions.selectObject(object.id);
              actions.toggleLock();
            }}>
              {object.locked ? <Lock size={16} /> : <Unlock size={16} />}
            </button>
          </div>
        ))}
        {document.objects.length === 0 ? <p>添加图片、文本或图形后会显示在这里。</p> : null}
      </div>
    </section>
  );
}
