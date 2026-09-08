import type { CSSProperties } from "react";

export type LayerSeparatorSelection = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type LayerSeparatorBoundingBox = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type LayerSeparatorFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LayerSeparatorTransform = LayerSeparatorFrame & {
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  visible: boolean;
};

export type LayerSeparatorAsset = {
  id: string;
  name?: string;
  url: string;
  /** The visible subject bounds inside a full-canvas transparent asset. */
  contentBounds?: LayerSeparatorFrame;
  /** Defaults to a full-canvas transform. */
  transform?: Partial<LayerSeparatorTransform>;
};

export type LayerSeparatorResult = {
  background: LayerSeparatorAsset;
  layers: LayerSeparatorAsset[];
};

export type LayerSeparatorRequest = {
  selections: LayerSeparatorBoundingBox[];
  instruction: string;
  prompt: string;
};

export type LayerSeparatorLabels = {
  title: string;
  description: string;
  selectionHint: string;
  instructionLabel: string;
  instructionPlaceholder: string;
  automatic: string;
  separate: string;
  cancel: string;
  reset: string;
  working: string;
  background: string;
  layers: string;
  merge: string;
  editHint: string;
  emptyLayers: string;
};

export type LayerSeparatorProps = {
  imageUrl: string;
  imageAlt?: string;
  aspectRatio?: number;
  defaultSelections?: LayerSeparatorSelection[];
  result?: LayerSeparatorResult | null;
  defaultResult?: LayerSeparatorResult | null;
  locale?: "zh-CN" | "en-US";
  labels?: Partial<LayerSeparatorLabels>;
  onSeparate?: (
    request: LayerSeparatorRequest,
  ) => Promise<LayerSeparatorResult | void> | LayerSeparatorResult | void;
  onResultChange?: (result: LayerSeparatorResult) => void;
  onMerge?: (blob: Blob, result: LayerSeparatorResult) => void;
  onCancel?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: CSSProperties;
};
