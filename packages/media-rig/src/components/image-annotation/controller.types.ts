import type React from "react";

export type AnnotationTool = "select" | "brush" | "rect" | "text";

export interface AnnotationController {
  open: boolean;
  tool: AnnotationTool;
  setTool: (tool: AnnotationTool) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (value: number) => void;
  ready: boolean;
  canUndo: boolean;
  canRedo: boolean;
  restoring: boolean;
  hasAnnotations: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
  deleteSelected: () => void;
  reset: () => void;
  isEditingText: () => boolean;
  exportOverlayCanvas: () => HTMLCanvasElement | null;
}
