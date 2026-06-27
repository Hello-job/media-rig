import type { CSSProperties } from "react";

export type EditorObjectType =
  | "image"
  | "text"
  | "rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "drawing";

export type ImageEditorTool =
  | "select"
  | "rect"
  | "ellipse"
  | "line"
  | "arrow"
  | "draw"
  | "text"
  | "image"
  | "crop";

export type ImageEditorPaintMode = "brush" | "eraser";

export type ImageEditorCanvas = {
  width: number;
  height: number;
  background: string | null;
};

export type EditorObject = {
  id: string;
  type: EditorObjectType;
  name: string;
  locked: boolean;
  visible: boolean;
  fabricData: Record<string, unknown>;
};

export type ImageEditorDocument = {
  version: 1;
  canvas: ImageEditorCanvas;
  objects: EditorObject[];
};

export type ImageEditorState = {
  activeTool: ImageEditorTool;
  paintMode: ImageEditorPaintMode;
  drawColor: string;
  drawWidth: number;
  drawOpacity: number;
  selectedIds: string[];
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  isLoading: boolean;
  layersOpen: boolean;
};

export type ImageEditorErrorCode =
  | "UNSUPPORTED_FILE"
  | "FILE_TOO_LARGE"
  | "IMAGE_DECODE_FAILED"
  | "IMAGE_CORS_FAILED"
  | "DOCUMENT_INVALID"
  | "DOCUMENT_VERSION_UNSUPPORTED"
  | "STORAGE_FAILED"
  | "EXPORT_FAILED"
  | "EXPORT_CORS_FAILED"
  | "CANVAS_INIT_FAILED";

export class ImageEditorError extends Error {
  readonly code: ImageEditorErrorCode;
  readonly cause?: unknown;

  constructor(code: ImageEditorErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "ImageEditorError";
    this.code = code;
    this.cause = cause;
  }
}

export type ExportOptions = {
  format?: "png" | "jpeg";
  quality?: number;
  transparent?: boolean;
  width?: number;
  height?: number;
  fileName?: string;
  download?: boolean;
};

export type ImageEditorProps = {
  className?: string;
  style?: CSSProperties;
  initialDocument?: ImageEditorDocument;
  storageKey?: string | false;
  maxImageSize?: number;
  historyLimit?: number;
  onChange?: (document: ImageEditorDocument) => void;
  onSelectionChange?: (objects: EditorObject[]) => void;
  onSave?: (document: ImageEditorDocument) => void;
  onExport?: (result: Blob) => void;
  onClose?: () => void;
  onError?: (error: ImageEditorError) => void;
};

export type ImageEditorHandle = {
  addImage(source: File | string): Promise<string>;
  addText(text?: string): string;
  loadDocument(document: ImageEditorDocument): Promise<void>;
  getDocument(): ImageEditorDocument;
  undo(): void;
  redo(): void;
  fitToViewport(): void;
  exportImage(options?: ExportOptions): Promise<Blob>;
};
