import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Canvas as FabricCanvas,
  IText as FabricIText,
  Rect as FabricRect,
} from "fabric";
import type {
  AnnotationController,
  AnnotationTool,
} from "./controller.types";
import {
  buildAnnotationBrushCursor,
  getFabricSelectionObjects,
  isFabricTextObject,
  serializeAnnotationCanvas,
  type FabricSnapshot,
} from "./fabric-canvas";

interface UseAnnotationControllerOptions {
  open: boolean;
  sourceImageUrl: string;
  onError: (error: Error) => void;
  disabled?: boolean;
}

const DEFAULT_COLOR = "#ff0000";
const DEFAULT_STROKE_WIDTH = 3;
const DEFAULT_FONT_SIZE = 24;

export function useAnnotationController({
  open,
  sourceImageUrl,
  onError,
  disabled = false,
}: UseAnnotationControllerOptions): AnnotationController {
  const [tool, setTool] = useState<AnnotationTool>("brush");
  const [color, setColorState] = useState(DEFAULT_COLOR);
  const [strokeWidth, setStrokeWidthState] = useState(DEFAULT_STROKE_WIDTH);
  const [history, setHistory] = useState({ canUndo: false, canRedo: false, restoring: false });
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const [ready, setReady] = useState(false);
  const [hasAnnotations, setHasAnnotations] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const fabricModuleRef = useRef<typeof import("fabric") | null>(null);
  const toolRef = useRef(tool);
  const colorRef = useRef(color);
  const strokeWidthRef = useRef(strokeWidth);
  const undoStackRef = useRef<FabricSnapshot[]>([]);
  const redoStackRef = useRef<FabricSnapshot[]>([]);
  const currentSnapshotRef = useRef<FabricSnapshot>("");
  const restoringRef = useRef(false);
  const draftRectRef = useRef<FabricRect | null>(null);
  const rectStartRef = useRef<{ x: number; y: number } | null>(null);

  toolRef.current = tool;
  colorRef.current = color;
  strokeWidthRef.current = strokeWidth;

  const commitChange = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || restoringRef.current) return;
    const nextSnapshot = serializeAnnotationCanvas(canvas);
    if (nextSnapshot === currentSnapshotRef.current) return;
    undoStackRef.current.push(currentSnapshotRef.current);
    redoStackRef.current = [];
    currentSnapshotRef.current = nextSnapshot;
    setHistory({ canUndo: undoStackRef.current.length > 0, canRedo: false, restoring: false });
    setHasAnnotations(canvas.getObjects().length > 0);
  }, []);

  const restoreSnapshot = useCallback(async (snapshot: FabricSnapshot) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || restoringRef.current) return;
    restoringRef.current = true;
    setHistory((state) => ({ ...state, restoring: true }));
    try {
      canvas.discardActiveObject();
      await canvas.loadFromJSON(snapshot);
      const selectable = toolRef.current === "select";
      canvas.selection = selectable;
      canvas.skipTargetFind = !selectable;
      canvas.getObjects().forEach((object) => {
        object.selectable = selectable;
        object.evented = selectable;
      });
      canvas.requestRenderAll();
      currentSnapshotRef.current = snapshot;
      setHasAnnotations(canvas.getObjects().length > 0);
    } catch (error) {
      onErrorRef.current(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setHistory({ canUndo: undoStackRef.current.length > 0, canRedo: redoStackRef.current.length > 0, restoring: false });
      restoringRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setReady(false);
      setHasAnnotations(false);
      return;
    }
    setTool("brush");
    setColorState(DEFAULT_COLOR);
    setStrokeWidthState(DEFAULT_STROKE_WIDTH);
  }, [open, sourceImageUrl]);

  useEffect(() => {
    if (!open || !canvasRef.current || !containerRef.current) return;

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;
    let canvas: FabricCanvas | null = null;
    let canvasSize = { width: 0, height: 0 };

    void import("fabric").then((fabric) => {
      if (cancelled || !canvasRef.current || !containerRef.current) return;

      fabricModuleRef.current = fabric;
      canvas = new fabric.Canvas(canvasRef.current, {
        enableRetinaScaling: false,
        renderOnAddRemove: true,
        preserveObjectStacking: true,
        selection: false,
      });
      fabricCanvasRef.current = canvas;
      undoStackRef.current = [];
      redoStackRef.current = [];
      currentSnapshotRef.current = serializeAnnotationCanvas(canvas);

      canvas.on("before:path:created", ({ path }) => {
        path.set({
          fill: null,
          stroke: colorRef.current,
          strokeWidth: strokeWidthRef.current,
          strokeLineCap: "round",
          strokeLineJoin: "round",
          objectCaching: false,
        });
      });

      canvas.on("path:created", ({ path }) => {
        path.set({ selectable: true, evented: true });
        commitChange();
      });
      canvas.on("object:modified", commitChange);
      canvas.on("text:editing:exited", ({ target }) => {
        const text = target as FabricIText;
        if (!text.text?.trim()) {
          canvas?.remove(text);
        }
        commitChange();
      });

      canvas.on("mouse:down", ({ e }) => {
        if (!canvas) return;
        if (toolRef.current === "text") {
          const point = canvas.getScenePoint(e);
          const text = new fabric.IText("输入文字", {
            left: point.x,
            top: point.y,
            fill: colorRef.current,
            fontFamily: "sans-serif",
            fontSize: DEFAULT_FONT_SIZE,
            fontWeight: 600,
            editingBorderColor: "#38bdf8",
            borderColor: "#38bdf8",
            cornerColor: "#ffffff",
            cornerStrokeColor: "#38bdf8",
            transparentCorners: false,
          });
          canvas.add(text);
          canvas.setActiveObject(text);
          setTool("select");
          text.enterEditing();
          text.selectAll();
          canvas.requestRenderAll();
          return;
        }
        if (toolRef.current !== "rect") return;
        const point = canvas.getScenePoint(e);
        rectStartRef.current = { x: point.x, y: point.y };
        const rect = new fabric.Rect({
          left: point.x,
          top: point.y,
          originX: "left",
          originY: "top",
          width: 1,
          height: 1,
          fill: "transparent",
          stroke: colorRef.current,
          strokeWidth: strokeWidthRef.current,
          strokeUniform: true,
          selectable: false,
          evented: false,
          objectCaching: false,
        });
        draftRectRef.current = rect;
        canvas.add(rect);
      });

      canvas.on("mouse:move", ({ e }) => {
        const start = rectStartRef.current;
        const rect = draftRectRef.current;
        if (!canvas || !start || !rect) return;
        const point = canvas.getScenePoint(e);
        rect.set({
          left: Math.min(start.x, point.x),
          top: Math.min(start.y, point.y),
          width: Math.abs(point.x - start.x),
          height: Math.abs(point.y - start.y),
        });
        rect.setCoords();
        canvas.requestRenderAll();
      });

      canvas.on("mouse:up", () => {
        const rect = draftRectRef.current;
        if (!canvas || !rect) return;
        if (rect.width < 3 || rect.height < 3) {
          canvas.remove(rect);
        } else {
          rect.set({ selectable: true, evented: true });
          commitChange();
        }
        draftRectRef.current = null;
        rectStartRef.current = null;
        canvas.requestRenderAll();
      });

      const resize = () => {
        const container = containerRef.current;
        if (!container || !canvas) return;
        const width = Math.max(1, Math.round(container.clientWidth));
        const height = Math.max(1, Math.round(container.clientHeight));
        if (!canvasSize.width) canvasSize = { width, height };
        canvas.setDimensions({ width, height });
        // Keep object coordinates and history stable when the container resizes.
        canvas.setViewportTransform([width / canvasSize.width, 0, 0, height / canvasSize.height, 0, 0]);
        canvas.wrapperEl.style.position = "absolute";
        canvas.wrapperEl.style.inset = "0";
        canvas.wrapperEl.style.width = "100%";
        canvas.wrapperEl.style.height = "100%";
        canvas.requestRenderAll();
        currentSnapshotRef.current = serializeAnnotationCanvas(canvas);
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(containerRef.current);
      resize();
      setReady(true);
    }).catch((error) => {
      if (!cancelled) onErrorRef.current(error instanceof Error ? error : new Error(String(error)));
    });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      setReady(false);
      draftRectRef.current = null;
      rectStartRef.current = null;
      undoStackRef.current = [];
      redoStackRef.current = [];
      if (canvas) {
        canvas.destroy();
      }
      if (fabricCanvasRef.current === canvas) {
        fabricCanvasRef.current = null;
      }
      fabricModuleRef.current = null;
    };
  }, [commitChange, open, sourceImageUrl]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const fabric = fabricModuleRef.current;
    if (!open || !canvas || !fabric) return;

    const selectable = tool === "select";
    canvas.isDrawingMode = tool === "brush";
    canvas.selection = selectable;
    canvas.skipTargetFind = !selectable;
    if (!selectable) {
      canvas.discardActiveObject();
    }
    canvas.getObjects().forEach((object) => {
      object.selectable = selectable;
      object.evented = selectable;
    });
    const cursor =
      tool === "brush"
        ? buildAnnotationBrushCursor(strokeWidth, color)
        : tool === "text"
          ? "text"
          : tool === "rect"
            ? "crosshair"
            : "default";
    canvas.defaultCursor = cursor;
    canvas.freeDrawingCursor = cursor;
    canvas.hoverCursor = selectable ? "move" : cursor;
    if (tool === "brush") {
      const brush = new fabric.PencilBrush(canvas);
      brush.width = strokeWidth;
      brush.color = color;
      canvas.freeDrawingBrush = brush;
    }
    canvas.upperCanvasEl.style.cursor = cursor;
    canvas.requestRenderAll();
  }, [color, open, ready, strokeWidth, tool]);

  const setColor = useCallback(
    (nextColor: string) => {
      setColorState(nextColor);
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const objects = getFabricSelectionObjects(canvas);
      if (objects.length === 0) return;
      objects.forEach((object) => {
        if (isFabricTextObject(object)) {
          object.set({ fill: nextColor });
        } else {
          object.set({ stroke: nextColor });
        }
      });
      canvas.requestRenderAll();
      commitChange();
    },
    [commitChange],
  );

  const setStrokeWidth = useCallback(
    (nextWidth: number) => {
      setStrokeWidthState(nextWidth);
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      const objects = getFabricSelectionObjects(canvas).filter(
        (object) => !isFabricTextObject(object),
      );
      if (objects.length === 0) return;
      objects.forEach((object) => object.set({ strokeWidth: nextWidth }));
      canvas.requestRenderAll();
      commitChange();
    },
    [commitChange],
  );

  const undo = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (restoringRef.current) return;
    const previous = undoStackRef.current.pop();
    if (!canvas || previous === undefined) return;
    redoStackRef.current.push(serializeAnnotationCanvas(canvas));
    void restoreSnapshot(previous);
  }, [restoreSnapshot]);

  const redo = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (restoringRef.current) return;
    const next = redoStackRef.current.pop();
    if (!canvas || next === undefined) return;
    undoStackRef.current.push(serializeAnnotationCanvas(canvas));
    void restoreSnapshot(next);
  }, [restoreSnapshot]);

  const deleteSelected = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const objects = getFabricSelectionObjects(canvas);
    if (objects.length === 0) return;
    canvas.remove(...objects);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    commitChange();
  }, [commitChange]);

  const reset = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || canvas.getObjects().length === 0) return;
    canvas.clear();
    canvas.requestRenderAll();
    commitChange();
  }, [commitChange]);

  const isEditingText = useCallback(() => {
    const active = fabricCanvasRef.current?.getActiveObject();
    return Boolean(
      active &&
      isFabricTextObject(active) &&
      Boolean((active as FabricIText).isEditing),
    );
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled || restoringRef.current) return;
      const target = event.target as HTMLElement | null;
      if (!containerRef.current?.closest(".image-annotation")?.contains(target)) return;
      if (
        isEditingText() ||
        target?.matches("input, textarea, [contenteditable='true']")
      ) {
        return;
      }
      const withMeta = event.metaKey || event.ctrlKey;
      if (withMeta && event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if (
        (event.key === "Backspace" || event.key === "Delete") &&
        fabricCanvasRef.current?.getActiveObject()
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        deleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [deleteSelected, disabled, isEditingText, open, redo, undo]);

  const exportOverlayCanvas = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || canvas.getObjects().length === 0) return null;
    canvas.discardActiveObject();
    canvas.renderAll();
    return canvas.toCanvasElement(1 / canvas.getZoom());
  }, []);

  return useMemo(
    () => ({
      open,
      tool,
      setTool,
      color,
      setColor,
      strokeWidth,
      setStrokeWidth,
      ready,
      hasAnnotations,
      ...history,
      containerRef,
      canvasRef,
      undo,
      redo,
      deleteSelected,
      reset,
      isEditingText,
      exportOverlayCanvas,
    }),
    [
      color,
      history,
      deleteSelected,
      exportOverlayCanvas,
      hasAnnotations,
      isEditingText,
      open,
      ready,
      redo,
      reset,
      setColor,
      setStrokeWidth,
      strokeWidth,
      tool,
      undo,
    ],
  );
}
