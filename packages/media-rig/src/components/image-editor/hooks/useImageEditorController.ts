import { FabricImage, PencilBrush, type FabricObject } from "fabric";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_HISTORY_LIMIT,
  DEFAULT_IMAGE_EDITOR_DOCUMENT,
  DEFAULT_MAX_IMAGE_SIZE,
} from "../ImageEditor.constants";
import {
  ImageEditorError,
  type EditorObject,
  type ExportOptions,
  type ImageEditorDocument,
  type ImageEditorProps,
  type ImageEditorPaintMode,
  type ImageEditorState,
  type ImageEditorTool,
} from "../ImageEditor.types";
import { CropSession } from "../core/CropSession";
import {
  loadDocumentIntoCanvas,
  serializeCanvas,
  validateDocument,
} from "../core/DocumentSerializer";
import { createDirectionalArrow, createEditorCommands } from "../core/EditorCommands";
import { downloadBlob, exportCanvas } from "../core/ExportService";
import { HistoryManager } from "../core/HistoryManager";
import { applyEraserStroke, colorWithOpacity } from "../core/PaintTools";
import {
  addImageToCanvas,
  fitImageToCanvas,
  flipImage,
  replaceImageSource,
} from "../core/ImageService";
import { calculateSnapPosition } from "../core/SnapGuides";
import { ensureEditorMetadata, type EditableFabricObject } from "../utils/editorObject";
import { useFabricCanvas } from "./useFabricCanvas";

function cloneDocument(document: ImageEditorDocument) {
  return structuredClone(document);
}

function resolveInitialDocument(props: ImageEditorProps) {
  let document = cloneDocument(props.initialDocument ?? DEFAULT_IMAGE_EDITOR_DOCUMENT);
  let error: ImageEditorError | null = null;
  if (typeof props.storageKey === "string" && props.storageKey.length > 0) {
    const stored = localStorage.getItem(props.storageKey);
    if (stored) {
      try {
        const value: unknown = JSON.parse(stored);
        validateDocument(value);
        document = cloneDocument(value);
      } catch (cause) {
        error = new ImageEditorError("STORAGE_FAILED", "本地保存的编辑文档无法读取", cause);
      }
    }
  }
  return { document, error };
}

function publicSelection(canvas: { getActiveObjects(): FabricObject[] }, document: ImageEditorDocument) {
  return serializeCanvas(
    { getObjects: () => canvas.getActiveObjects() as EditableFabricObject[] },
    document.canvas,
  ).objects;
}

export function useImageEditorController(props: ImageEditorProps = {}) {
  const initialRef = useRef(resolveInitialDocument(props));
  const [document, setDocument] = useState(() => cloneDocument(initialRef.current.document));
  const documentRef = useRef(document);
  documentRef.current = document;
  const [selectedObjects, setSelectedObjects] = useState<EditorObject[]>([]);
  const [state, setState] = useState<ImageEditorState>({
    activeTool: "select",
    paintMode: "brush",
    drawColor: "#ff2d20",
    drawWidth: 4,
    drawOpacity: 1,
    selectedIds: [],
    zoom: 1,
    canUndo: false,
    canRedo: false,
    isDirty: false,
    isLoading: false,
    layersOpen: false,
  });
  const stateRef = useRef(state);
  stateRef.current = state;
  const historyRef = useRef(
    new HistoryManager<ImageEditorDocument>(props.historyLimit ?? DEFAULT_HISTORY_LIMIT),
  );
  const restoringRef = useRef(false);
  const snapDisabledRef = useRef(false);
  const cropRef = useRef<CropSession | null>(null);
  const arrowGestureRef = useRef<{
    start: { x: number; y: number };
    preview: FabricObject;
  } | null>(null);
  const { canvas, canvasElementRef, viewportRef, zoom, setZoom, fitToViewport } = useFabricCanvas(
    document.canvas,
  );
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const commands = useMemo(() => (canvas ? createEditorCommands(canvas) : null), [canvas]);

  const configurePaintBrush = useCallback(
    (mode: ImageEditorPaintMode) => {
      if (!canvas) return;
      const brush = new PencilBrush(canvas);
      brush.color =
        mode === "eraser"
          ? "rgba(255,255,255,0.65)"
          : colorWithOpacity(stateRef.current.drawColor, stateRef.current.drawOpacity);
      brush.width = stateRef.current.drawWidth;
      canvas.freeDrawingBrush = brush;
      canvas.isDrawingMode = true;
    },
    [canvas],
  );

  const reportError = useCallback(
    (error: unknown, fallbackCode: ImageEditorError["code"] = "CANVAS_INIT_FAILED") => {
      const next =
        error instanceof ImageEditorError
          ? error
          : new ImageEditorError(fallbackCode, "图片编辑器操作失败", error);
      props.onError?.(next);
      return next;
    },
    [props.onError],
  );

  useEffect(() => {
    if (initialRef.current.error) props.onError?.(initialRef.current.error);
  }, [props.onError]);

  const syncHistoryState = useCallback(() => {
    setState((current) => ({
      ...current,
      canUndo: historyRef.current.canUndo,
      canRedo: historyRef.current.canRedo,
    }));
  }, []);

  const persist = useCallback(
    (next: ImageEditorDocument) => {
      if (typeof props.storageKey !== "string" || props.storageKey.length === 0) return;
      try {
        localStorage.setItem(props.storageKey, JSON.stringify(next));
      } catch (error) {
        reportError(new ImageEditorError("STORAGE_FAILED", "编辑文档保存失败", error));
      }
    },
    [props.storageKey, reportError],
  );

  const publishDocument = useCallback(
    (next: ImageEditorDocument, addToHistory = true) => {
      const cloned = cloneDocument(next);
      documentRef.current = cloned;
      setDocument(cloned);
      if (addToHistory) historyRef.current.commit(cloned);
      setState((current) => ({
        ...current,
        isDirty: true,
        canUndo: historyRef.current.canUndo,
        canRedo: historyRef.current.canRedo,
      }));
      persist(cloned);
      props.onChange?.(cloneDocument(cloned));
    },
    [persist, props.onChange],
  );

  const commitCanvas = useCallback(
    (canvasState = documentRef.current.canvas) => {
      if (!canvas || restoringRef.current) return null;
      const next = serializeCanvas(canvas as never, canvasState);
      publishDocument(next);
      return next;
    },
    [canvas, publishDocument],
  );

  const syncSelection = useCallback(() => {
    if (!canvas) return;
    const selected = publicSelection(canvas, documentRef.current);
    setSelectedObjects(selected);
    setState((current) => ({ ...current, selectedIds: selected.map((object) => object.id) }));
    props.onSelectionChange?.(cloneDocument({
      version: 1,
      canvas: documentRef.current.canvas,
      objects: selected,
    }).objects);
  }, [canvas, props.onSelectionChange]);

  useEffect(() => {
    if (!canvas) return;
    let active = true;
    restoringRef.current = true;
    setState((current) => ({ ...current, isLoading: true }));
    void loadDocumentIntoCanvas(canvas as never, documentRef.current)
      .then((loaded) => {
        if (!active) return;
        historyRef.current.reset(loaded);
        syncHistoryState();
      })
      .catch(reportError)
      .finally(() => {
        if (!active) return;
        restoringRef.current = false;
        setState((current) => ({ ...current, isLoading: false }));
      });

    const selectionHandler = () => syncSelection();
    const modifiedHandler = () => commitCanvas();
    const pathHandler = (event: any) => {
      if (!event.path) return;
      if (stateRef.current.paintMode === "eraser") {
        void applyEraserStroke(canvas, event.path)
          .then((changed) => {
            if (changed) commitCanvas();
          })
          .catch(reportError);
        return;
      }
      ensureEditorMetadata(event.path, "drawing", "画笔");
      commitCanvas();
    };
    const movingHandler = (event: any) => {
      const target = event.target as FabricObject | undefined;
      if (!target) return;
      const bounds = target.getBoundingRect();
      const others = canvas
        .getObjects()
        .filter((object) => object !== target)
        .map((object) => object.getBoundingRect());
      const snapped = calculateSnapPosition(
        bounds,
        others,
        { width: canvas.getWidth(), height: canvas.getHeight() },
        6 / Math.max(zoomRef.current, 0.1),
        snapDisabledRef.current,
      );
      target.set({
        left: (target.left ?? 0) + snapped.left - bounds.left,
        top: (target.top ?? 0) + snapped.top - bounds.top,
      });
    };
    const scenePoint = (event: any) => canvas.getScenePoint(event.e);
    const mouseDownHandler = (event: any) => {
      const current = stateRef.current;
      if (current.activeTool === "arrow") {
        const start = scenePoint(event);
        const preview = createDirectionalArrow(
          start,
          { x: start.x + 1, y: start.y },
          "#ff2d20",
          current.drawWidth,
        );
        preview.set({ selectable: false, evented: false, opacity: 0.85 });
        canvas.discardActiveObject();
        canvas.add(preview);
        arrowGestureRef.current = { start, preview };
        canvas.requestRenderAll();
        return;
      }
    };
    const mouseMoveHandler = (event: any) => {
      const gesture = arrowGestureRef.current;
      if (gesture) {
        const end = scenePoint(event);
        canvas.remove(gesture.preview);
        const preview = createDirectionalArrow(
          gesture.start,
          end,
          "#ff2d20",
          stateRef.current.drawWidth,
        );
        preview.set({ selectable: false, evented: false, opacity: 0.85 });
        canvas.add(preview);
        arrowGestureRef.current = { ...gesture, preview };
        canvas.requestRenderAll();
        return;
      }
    };
    const mouseUpHandler = (event: any) => {
      const gesture = arrowGestureRef.current;
      if (gesture) {
        const end = scenePoint(event);
        canvas.remove(gesture.preview);
        arrowGestureRef.current = null;
        if (Math.hypot(end.x - gesture.start.x, end.y - gesture.start.y) >= 4) {
          const arrow = createDirectionalArrow(
            gesture.start,
            end,
            "#ff2d20",
            stateRef.current.drawWidth,
          );
          canvas.add(arrow);
          canvas.setActiveObject(arrow);
          arrow.setCoords();
          canvas.requestRenderAll();
          commitCanvas();
          syncSelection();
        }
        canvas.selection = true;
        canvas.defaultCursor = "default";
        stateRef.current = { ...stateRef.current, activeTool: "select" };
        setState((current) => ({ ...current, activeTool: "select" }));
        return;
      }
    };
    canvas.on("selection:created", selectionHandler);
    canvas.on("selection:updated", selectionHandler);
    canvas.on("selection:cleared", selectionHandler);
    canvas.on("object:modified", modifiedHandler);
    canvas.on("path:created", pathHandler);
    canvas.on("object:moving", movingHandler);
    canvas.on("mouse:down", mouseDownHandler);
    canvas.on("mouse:move", mouseMoveHandler);
    canvas.on("mouse:up", mouseUpHandler);
    canvas.on("text:editing:exited" as any, modifiedHandler);
    return () => {
      active = false;
      canvas.off("selection:created", selectionHandler);
      canvas.off("selection:updated", selectionHandler);
      canvas.off("selection:cleared", selectionHandler);
      canvas.off("object:modified", modifiedHandler);
      canvas.off("path:created", pathHandler);
      canvas.off("object:moving", movingHandler);
      canvas.off("mouse:down", mouseDownHandler);
      canvas.off("mouse:move", mouseMoveHandler);
      canvas.off("mouse:up", mouseUpHandler);
      canvas.off("text:editing:exited" as any, modifiedHandler);
      if (arrowGestureRef.current) canvas.remove(arrowGestureRef.current.preview);
      arrowGestureRef.current = null;
    };
  }, [canvas, commitCanvas, reportError, syncHistoryState, syncSelection]);

  useEffect(() => {
    setState((current) => ({ ...current, zoom }));
  }, [zoom]);

  const applyDocument = useCallback(
    async (next: ImageEditorDocument, resetHistory: boolean) => {
      if (!canvas) {
        documentRef.current = cloneDocument(next);
        setDocument(cloneDocument(next));
        return;
      }
      restoringRef.current = true;
      setState((current) => ({ ...current, isLoading: true }));
      try {
        const loaded = await loadDocumentIntoCanvas(canvas as never, next);
        documentRef.current = cloneDocument(loaded);
        setDocument(cloneDocument(loaded));
        if (resetHistory) historyRef.current.reset(loaded);
        setSelectedObjects([]);
        setState((current) => ({
          ...current,
          selectedIds: [],
          isDirty: false,
          canUndo: historyRef.current.canUndo,
          canRedo: historyRef.current.canRedo,
        }));
      } catch (error) {
        throw reportError(error, "DOCUMENT_INVALID");
      } finally {
        restoringRef.current = false;
        setState((current) => ({ ...current, isLoading: false }));
      }
    },
    [canvas, reportError],
  );

  const actions = useMemo(() => ({
    setTool(tool: ImageEditorTool) {
      stateRef.current = { ...stateRef.current, activeTool: tool };
      setState((current) => ({ ...current, activeTool: tool }));
      if (canvas) {
        const paintMode = stateRef.current.paintMode;
        canvas.isDrawingMode = tool === "draw";
        canvas.selection = tool !== "draw" && tool !== "arrow";
        canvas.defaultCursor = tool === "draw" || tool === "arrow" ? "crosshair" : "default";
        if (tool === "draw" || tool === "arrow") {
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          syncSelection();
        }
        if (tool === "draw") configurePaintBrush(paintMode);
      }
    },
    setPaintMode(mode: ImageEditorPaintMode) {
      if (canvas) {
        canvas.selection = false;
        canvas.isDrawingMode = true;
        canvas.defaultCursor = mode === "brush" ? "crosshair" : "cell";
        configurePaintBrush(mode);
      }
      stateRef.current = { ...stateRef.current, paintMode: mode };
      setState((current) => ({ ...current, paintMode: mode }));
    },
    setDrawColor(color: string) {
      stateRef.current = { ...stateRef.current, drawColor: color };
      setState((current) => ({ ...current, drawColor: color }));
      if (stateRef.current.paintMode === "brush") configurePaintBrush("brush");
    },
    setDrawWidth(width: number) {
      const drawWidth = Math.min(40, Math.max(1, width));
      stateRef.current = { ...stateRef.current, drawWidth };
      setState((current) => ({ ...current, drawWidth }));
      if (canvas?.freeDrawingBrush) canvas.freeDrawingBrush.width = drawWidth;
    },
    setDrawOpacity(opacity: number) {
      const drawOpacity = Math.min(1, Math.max(0.1, opacity));
      stateRef.current = { ...stateRef.current, drawOpacity };
      setState((current) => ({ ...current, drawOpacity }));
      if (stateRef.current.paintMode === "brush") configurePaintBrush("brush");
    },
    toggleLayers() {
      setState((current) => ({ ...current, layersOpen: !current.layersOpen }));
    },
    setZoom,
    fitToViewport,
    setSnapDisabled(disabled: boolean) {
      snapDisabledRef.current = disabled;
    },
    async addImage(source: File | string) {
      if (!canvas) return "";
      setState((current) => ({ ...current, isLoading: true }));
      try {
        const id = await addImageToCanvas(
          canvas,
          source,
          props.maxImageSize ?? DEFAULT_MAX_IMAGE_SIZE,
        );
        commitCanvas();
        syncSelection();
        return id;
      } catch (error) {
        throw reportError(error, "IMAGE_DECODE_FAILED");
      } finally {
        setState((current) => ({ ...current, isLoading: false }));
      }
    },
    addText(text?: string) {
      const id = commands?.addText(text) ?? "";
      if (id) {
        commitCanvas();
        syncSelection();
      }
      return id;
    },
    addRect() {
      const id = commands?.addRect() ?? "";
      if (id) commitCanvas();
      return id;
    },
    addEllipse() {
      const id = commands?.addEllipse() ?? "";
      if (id) commitCanvas();
      return id;
    },
    addLine() {
      const id = commands?.addLine() ?? "";
      if (id) commitCanvas();
      return id;
    },
    addArrow() {
      const id = commands?.addArrow() ?? "";
      if (id) commitCanvas();
      return id;
    },
    async duplicateSelection() {
      const changed = (await commands?.duplicateSelection()) ?? false;
      if (changed) commitCanvas();
      return changed;
    },
    deleteSelection() {
      if (commands?.deleteSelection()) commitCanvas();
    },
    toggleLock() {
      if (commands?.toggleLock()) commitCanvas();
    },
    toggleVisibility() {
      if (commands?.toggleVisibility()) commitCanvas();
    },
    bringForward() {
      if (commands?.bringForward()) commitCanvas();
    },
    sendBackward() {
      if (commands?.sendBackward()) commitCanvas();
    },
    bringToFront() {
      if (commands?.bringToFront()) commitCanvas();
    },
    sendToBack() {
      if (commands?.sendToBack()) commitCanvas();
    },
    alignHorizontalCenter() {
      if (commands?.alignHorizontalCenter()) commitCanvas();
    },
    alignVerticalCenter() {
      if (commands?.alignVerticalCenter()) commitCanvas();
    },
    alignCenter() {
      if (commands?.alignCenter()) commitCanvas();
    },
    clearSelection() {
      canvas?.discardActiveObject();
      canvas?.requestRenderAll();
      syncSelection();
    },
    selectObject(id: string) {
      const object = canvas?.getObjects().find((candidate) => (candidate as any).id === id);
      if (!object) return;
      canvas?.setActiveObject(object);
      canvas?.requestRenderAll();
      syncSelection();
    },
    updateSelection(properties: Record<string, unknown>) {
      if (!canvas || canvas.getActiveObjects().length === 0) return;
      for (const object of canvas.getActiveObjects()) {
        object.set(properties);
        object.setCoords();
      }
      canvas.requestRenderAll();
      commitCanvas();
      syncSelection();
    },
    setCanvasSize(width: number, height: number) {
      if (!canvas || width <= 0 || height <= 0) return;
      canvas.setDimensions({ width, height });
      commitCanvas({ ...documentRef.current.canvas, width, height });
      fitToViewport();
    },
    setBackground(background: string | null) {
      if (!canvas) return;
      canvas.backgroundColor = background ?? "rgba(0,0,0,0)";
      canvas.requestRenderAll();
      commitCanvas({ ...documentRef.current.canvas, background });
    },
    async newDocument() {
      await applyDocument(DEFAULT_IMAGE_EDITOR_DOCUMENT, true);
    },
    clearDocument() {
      if (!canvas) return;
      canvas.remove(...canvas.getObjects());
      canvas.discardActiveObject();
      commitCanvas();
      syncSelection();
    },
    async loadDocument(next: ImageEditorDocument) {
      validateDocument(next);
      await applyDocument(next, true);
    },
    undo() {
      const previous = historyRef.current.undo();
      if (!previous) return;
      void applyDocument(previous, false).then(syncHistoryState);
    },
    redo() {
      const next = historyRef.current.redo();
      if (!next) return;
      void applyDocument(next, false).then(syncHistoryState);
    },
    save() {
      props.onSave?.(cloneDocument(documentRef.current));
      setState((current) => ({ ...current, isDirty: false }));
      return cloneDocument(documentRef.current);
    },
    async exportImage(options: ExportOptions = {}) {
      if (!canvas) throw new ImageEditorError("EXPORT_FAILED", "画布尚未准备完成");
      const blob = await exportCanvas(canvas, documentRef.current, options);
      if (options.download) {
        const extension = options.format ?? "png";
        downloadBlob(blob, options.fileName ?? `image-editor.${extension}`);
      }
      props.onExport?.(blob);
      return blob;
    },
    startCrop() {
      const image = canvas?.getActiveObject();
      if (!(image instanceof FabricImage)) return false;
      cropRef.current = CropSession.start(image);
      setState((current) => ({ ...current, activeTool: "crop" }));
      return true;
    },
    panCrop(x: number, y: number) {
      cropRef.current?.pan(x, y);
      canvas?.requestRenderAll();
    },
    zoomCrop(factor: number) {
      cropRef.current?.zoom(factor);
      canvas?.requestRenderAll();
    },
    confirmCrop() {
      const result = cropRef.current?.confirm();
      cropRef.current = null;
      setState((current) => ({ ...current, activeTool: "select" }));
      if (result?.changed) commitCanvas();
    },
    cancelCrop() {
      cropRef.current?.cancel();
      cropRef.current = null;
      setState((current) => ({ ...current, activeTool: "select" }));
      canvas?.requestRenderAll();
    },
    fitImage(mode: "contain" | "cover") {
      const image = canvas?.getActiveObject();
      if (!(image instanceof FabricImage) || !canvas) return;
      fitImageToCanvas(image, canvas, mode);
      canvas.requestRenderAll();
      commitCanvas();
    },
    flipImage(axis: "x" | "y") {
      const image = canvas?.getActiveObject();
      if (!(image instanceof FabricImage) || !canvas) return;
      flipImage(image, axis);
      canvas.requestRenderAll();
      commitCanvas();
    },
    async replaceImage(source: File | string) {
      const image = canvas?.getActiveObject();
      if (!(image instanceof FabricImage) || !canvas) return;
      await replaceImageSource(image, source, props.maxImageSize);
      canvas.requestRenderAll();
      commitCanvas();
    },
  }), [
    applyDocument,
    canvas,
    commands,
    commitCanvas,
    configurePaintBrush,
    fitToViewport,
    props.maxImageSize,
    props.onExport,
    props.onSave,
    reportError,
    setZoom,
    syncHistoryState,
    syncSelection,
  ]);

  return {
    canvas,
    canvasElementRef,
    viewportRef,
    document,
    state,
    selectedObjects,
    actions,
  };
}

export type ImageEditorController = ReturnType<typeof useImageEditorController>;
export type ImageEditorActions = ImageEditorController["actions"];
