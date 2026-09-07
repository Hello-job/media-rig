import {
  Eye,
  EyeOff,
  Layers3,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Undo2,
  Redo2,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type {
  LayerSeparatorLabels,
  LayerSeparatorProps,
  LayerSeparatorResult,
  LayerSeparatorSelection,
  LayerSeparatorTransform,
} from "./LayerSeparator.types";
import {
  buildLayerSeparatorPrompt,
  composeLayerSeparatorResult,
  isUsableSelection,
  normalizeResult,
  normalizeTransform,
  toBoundingBox,
} from "./LayerSeparator.utils";
import CompositionStage from "./parts/CompositionStage";
import SelectionStage from "./parts/SelectionStage";
import "./LayerSeparator.css";

const COPY: Record<"zh-CN" | "en-US", LayerSeparatorLabels> = {
  "zh-CN": {
    title: "图层分离",
    description: "框选画面元素，或让模型自动识别主体",
    selectionHint: "拖拽框选想要拆分的物体",
    instructionLabel: "分层说明",
    instructionPlaceholder: "描述想拆出的图层；留空将自动识别主体",
    automatic: "自动拆分",
    separate: "开始分层",
    cancel: "取消",
    reset: "重新框选",
    working: "正在识别图层",
    background: "背景层",
    layers: "分离图层",
    merge: "合并并导出",
    editHint: "拖动图层调整位置，使用浮动工具旋转或翻转",
    emptyLayers: "服务已返回背景图，但没有可编辑图层。",
  },
  "en-US": {
    title: "Layer separator",
    description: "Select objects, or let the model find the main subjects",
    selectionHint: "Drag to select objects to separate",
    instructionLabel: "Layer instructions",
    instructionPlaceholder: "Describe the layers to extract, or leave blank for automatic detection",
    automatic: "Auto separate",
    separate: "Separate layers",
    cancel: "Cancel",
    reset: "Select again",
    working: "Detecting layers",
    background: "Background",
    layers: "Separated layers",
    merge: "Merge and export",
    editHint: "Drag a layer to move it. Use the floating controls to rotate or flip.",
    emptyLayers: "The service returned a background without editable layers.",
  },
};

function readPointerRatio(event: ReactPointerEvent<HTMLDivElement>, element: HTMLDivElement) {
  const rect = element.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
  };
}

export default function LayerSeparator({
  imageUrl,
  imageAlt = "",
  aspectRatio = 1,
  defaultSelections = [],
  result,
  defaultResult = null,
  locale = "zh-CN",
  labels,
  onSeparate,
  onResultChange,
  onMerge,
  onCancel,
  onError,
  className,
  style,
}: LayerSeparatorProps) {
  const copy = useMemo(() => ({ ...COPY[locale], ...labels }), [labels, locale]);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const selectionSequence = useRef(defaultSelections.length);
  const [selections, setSelections] = useState(defaultSelections);
  const [draft, setDraft] = useState<LayerSeparatorSelection | null>(null);
  const [undoStack, setUndoStack] = useState<LayerSeparatorSelection[][]>([]);
  const [redoStack, setRedoStack] = useState<LayerSeparatorSelection[][]>([]);
  const [instruction, setInstruction] = useState("");
  const [internalResult, setInternalResult] = useState<LayerSeparatorResult | null>(() =>
    defaultResult ? normalizeResult(defaultResult) : null,
  );
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [merging, setMerging] = useState(false);
  const [progress, setProgress] = useState(8);
  const [error, setError] = useState<string | null>(null);
  const resolvedResult = useMemo(
    () => (result !== undefined ? (result ? normalizeResult(result) : null) : internalResult),
    [internalResult, result],
  );

  useEffect(() => {
    if (!submitting) return;
    setProgress(8);
    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(94, current + Math.max(1, Math.ceil((94 - current) * 0.08))));
    }, 620);
    return () => window.clearInterval(timer);
  }, [submitting]);

  useEffect(() => {
    setSelectedLayerId((current) => {
      if (current && resolvedResult?.layers.some((layer) => layer.id === current)) return current;
      return resolvedResult?.layers[0]?.id ?? null;
    });
  }, [resolvedResult]);

  const commitSelections = (next: LayerSeparatorSelection[]) => {
    setUndoStack((current) => [...current, selections]);
    setRedoStack([]);
    setSelections(next);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !stageRef.current || submitting) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = readPointerRatio(event, stageRef.current);
    selectionSequence.current += 1;
    setDraft({
      id: `selection-${selectionSequence.current}`,
      x1: point.x,
      y1: point.y,
      x2: point.x,
      y2: point.y,
    });
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draft || !stageRef.current) return;
    const point = readPointerRatio(event, stageRef.current);
    setDraft((current) => (current ? { ...current, x2: point.x, y2: point.y } : null));
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draft) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (isUsableSelection(draft)) commitSelections([...selections, draft]);
    setDraft(null);
  };

  const undo = () => {
    const previous = undoStack[undoStack.length - 1];
    if (!previous) return;
    setUndoStack((current) => current.slice(0, -1));
    setRedoStack((current) => [selections, ...current]);
    setSelections(previous);
  };

  const redo = () => {
    const next = redoStack[0];
    if (!next) return;
    setRedoStack((current) => current.slice(1));
    setUndoStack((current) => [...current, selections]);
    setSelections(next);
  };

  const updateResult = (next: LayerSeparatorResult) => {
    const normalized = normalizeResult(next);
    if (result === undefined) setInternalResult(normalized);
    onResultChange?.(normalized);
  };

  const separate = async () => {
    if (!onSeparate || submitting) return;
    const boxes = selections.map(toBoundingBox);
    setError(null);
    setSubmitting(true);
    try {
      const next = await onSeparate({
        selections: boxes,
        instruction: instruction.trim(),
        prompt: buildLayerSeparatorPrompt(boxes, instruction),
      });
      if (next) updateResult(next);
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error(String(cause));
      setError(nextError.message);
      onError?.(nextError);
    } finally {
      setSubmitting(false);
    }
  };

  const patchLayer = (id: string, transform: LayerSeparatorTransform) => {
    if (!resolvedResult) return;
    updateResult({
      ...resolvedResult,
      layers: resolvedResult.layers.map((layer) =>
        layer.id === id ? { ...layer, transform } : layer,
      ),
    });
  };

  const reset = () => {
    if (result === undefined) setInternalResult(null);
    setSelections([]);
    setUndoStack([]);
    setRedoStack([]);
    setInstruction("");
    setError(null);
  };

  const merge = async () => {
    if (!resolvedResult || merging) return;
    setMerging(true);
    setError(null);
    try {
      const blob = await composeLayerSeparatorResult(resolvedResult);
      if (onMerge) onMerge(blob, resolvedResult);
      else {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "layer-composition.png";
        anchor.click();
        URL.revokeObjectURL(url);
      }
    } catch (cause) {
      const nextError = cause instanceof Error ? cause : new Error(String(cause));
      setError(nextError.message);
      onError?.(nextError);
    } finally {
      setMerging(false);
    }
  };

  return (
    <section
      data-slot="layer-separator"
      className={["layer-separator", className].filter(Boolean).join(" ")}
      style={style}
      aria-label={copy.title}
    >
      <header className="layer-separator__header">
        <div className="layer-separator__heading">
          <span className="layer-separator__mark"><Layers3 size={18} /></span>
          <span><strong>{copy.title}</strong><small>{copy.description}</small></span>
        </div>
        <div className="layer-separator__history" aria-label="History controls">
          <button type="button" onClick={undo} disabled={Boolean(resolvedResult) || undoStack.length === 0} aria-label="Undo"><Undo2 size={16} /></button>
          <button type="button" onClick={redo} disabled={Boolean(resolvedResult) || redoStack.length === 0} aria-label="Redo"><Redo2 size={16} /></button>
          <button type="button" onClick={onCancel ?? reset} aria-label={copy.cancel}><X size={17} /></button>
        </div>
      </header>

      <div className="layer-separator__body">
        <main className="layer-separator__workspace">
          <div className="layer-separator__stage-wrap">
            {resolvedResult ? (
              <CompositionStage
                result={resolvedResult}
                aspectRatio={aspectRatio}
                backgroundLabel={copy.background}
                selectedId={selectedLayerId}
                onSelect={setSelectedLayerId}
                onChange={patchLayer}
              />
            ) : (
              <SelectionStage
                stageRef={stageRef}
                imageUrl={imageUrl}
                imageAlt={imageAlt}
                aspectRatio={aspectRatio}
                selections={selections}
                draft={draft}
                hint={copy.selectionHint}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => setDraft(null)}
              />
            )}
            {submitting ? (
              <div className="layer-separator__loading" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                <LoaderCircle size={22} />
                <span>{copy.working}</span><strong>{progress}%</strong>
              </div>
            ) : null}
          </div>
        </main>

        <aside className="layer-separator__panel">
          {resolvedResult ? (
            <>
              <div className="layer-separator__panel-heading"><span>{copy.layers}</span><small>{resolvedResult.layers.length}</small></div>
              <p className="layer-separator__edit-hint">{copy.editHint}</p>
              <div className="layer-separator__layer-list">
                <div className="layer-separator__layer-row is-background"><span className="layer-separator__layer-index">B</span><span>{resolvedResult.background.name ?? copy.background}</span></div>
                {resolvedResult.layers.map((layer, index) => {
                  const transform = normalizeTransform(layer.transform);
                  return (
                    <div key={layer.id} className={["layer-separator__layer-row", selectedLayerId === layer.id ? "is-selected" : ""].join(" ")}>
                      <button type="button" className="layer-separator__layer-main" onClick={() => setSelectedLayerId(layer.id)}>
                        <span className="layer-separator__layer-index">{String(index + 1).padStart(2, "0")}</span>
                        <span>{layer.name ?? `Layer ${index + 1}`}</span>
                      </button>
                      <button type="button" className="layer-separator__visibility" aria-label={transform.visible ? "Hide layer" : "Show layer"} onClick={() => patchLayer(layer.id, { ...transform, visible: !transform.visible })}>
                        {transform.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                    </div>
                  );
                })}
                {resolvedResult.layers.length === 0 ? <p className="layer-separator__empty">{copy.emptyLayers}</p> : null}
              </div>
              {selectedLayerId ? (() => {
                const selected = resolvedResult.layers.find((layer) => layer.id === selectedLayerId);
                if (!selected) return null;
                const transform = normalizeTransform(selected.transform);
                return (
                  <label className="layer-separator__scale">
                    <span>Scale <output>{Math.round(transform.width * 100)}%</output></span>
                    <input type="range" min="20" max="160" value={Math.round(transform.width * 100)} onChange={(event) => {
                      const width = Number(event.target.value) / 100;
                      patchLayer(selected.id, { ...transform, width, height: transform.height * (width / transform.width) });
                    }} />
                  </label>
                );
              })() : null}
              <div className="layer-separator__panel-actions">
                <button type="button" className="layer-separator__secondary" onClick={reset}><RotateCcw size={15} />{copy.reset}</button>
                <button type="button" className="layer-separator__primary" disabled={merging} onClick={() => void merge()}>{merging ? <LoaderCircle className="is-spinning" size={15} /> : <Layers3 size={15} />}{copy.merge}</button>
              </div>
            </>
          ) : (
            <>
              <div className="layer-separator__panel-heading"><span>{copy.instructionLabel}</span><small>{selections.length}</small></div>
              <div className="layer-separator__selection-list">
                {selections.map((selection, index) => {
                  const left = Math.min(selection.x1, selection.x2);
                  const top = Math.min(selection.y1, selection.y2);
                  const width = Math.max(0.001, Math.abs(selection.x2 - selection.x1));
                  const height = Math.max(0.001, Math.abs(selection.y2 - selection.y1));
                  return (
                    <button key={selection.id} type="button" aria-label={`Remove selection ${index + 1}`} onClick={() => commitSelections(selections.filter((item) => item.id !== selection.id))}>
                      <span style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: `${100 / width}% ${100 / height}%`, backgroundPosition: `${(-left / width) * 100}% ${(-top / height) * 100}%` }} />
                      <strong>{String(index + 1).padStart(2, "0")}</strong><X size={13} />
                    </button>
                  );
                })}
              </div>
              <textarea value={instruction} rows={5} placeholder={copy.instructionPlaceholder} aria-label={copy.instructionLabel} onChange={(event) => setInstruction(event.target.value)} />
              {error ? <p className="layer-separator__error" role="alert">{error}</p> : null}
              <div className="layer-separator__panel-actions">
                <button type="button" className="layer-separator__secondary" disabled={submitting} onClick={onCancel ?? reset}>{copy.cancel}</button>
                <button type="button" className="layer-separator__primary" disabled={submitting || !onSeparate} onClick={() => void separate()}><Sparkles size={15} />{selections.length ? `${copy.separate} · ${selections.length + 1}` : copy.automatic}</button>
              </div>
            </>
          )}
          {error && resolvedResult ? <p className="layer-separator__error" role="alert">{error}</p> : null}
        </aside>
      </div>
    </section>
  );
}
