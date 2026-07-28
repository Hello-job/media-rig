import type { ImageEditorDocument } from "./ImageEditor.types";

export const DEFAULT_IMAGE_EDITOR_DOCUMENT: ImageEditorDocument = {
  version: 1,
  canvas: {
    width: 1024,
    height: 1024,
    background: "#ffffff",
  },
  objects: [],
};

export const DEFAULT_HISTORY_LIMIT = 50;
export const DEFAULT_MAX_IMAGE_SIZE = 15 * 1024 * 1024;

export const ASPECT_RATIO_OPTIONS = [
  { id: "custom", label: "custom", value: null },
  { id: "16:9", label: "16:9", value: 16 / 9 },
  { id: "9:16", label: "9:16", value: 9 / 16 },
  { id: "4:3", label: "4:3", value: 4 / 3 },
  { id: "3:4", label: "3:4", value: 3 / 4 },
  { id: "1:1", label: "1:1", value: 1 },
  { id: "3:2", label: "3:2", value: 3 / 2 },
  { id: "2:3", label: "2:3", value: 2 / 3 },
  { id: "7:4", label: "7:4", value: 7 / 4 },
  { id: "4:7", label: "4:7", value: 4 / 7 },
  { id: "21:9", label: "21:9", value: 21 / 9 },
] as const;
