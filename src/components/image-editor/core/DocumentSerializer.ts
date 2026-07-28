import type { FabricObject } from "fabric";
import {
  ImageEditorError,
  type EditorObject,
  type EditorObjectType,
  type ImageEditorCanvas,
  type ImageEditorDocument,
} from "../ImageEditor.types";
import {
  applyEditorLocked,
  SERIALIZED_EDITOR_PROPERTIES,
  type EditableFabricObject,
} from "../utils/editorObject";

const SUPPORTED_TYPES = new Set<EditorObjectType>([
  "image",
  "text",
  "rect",
  "ellipse",
  "line",
  "arrow",
  "drawing",
]);

type SerializableObject = {
  id: string;
  editorType: EditorObjectType;
  name: string;
  editorLocked?: boolean;
  visible?: boolean;
  toObject(properties?: readonly string[]): Record<string, unknown>;
};

type SerializableCanvas = {
  getObjects(): SerializableObject[];
};

type LoadableObject = SerializableObject & {
  set(options: Record<string, unknown>): unknown;
  setControlsVisibility?(options: Record<string, boolean>): unknown;
};

type LoadableCanvas = {
  backgroundColor: string;
  setDimensions(size: { width: number; height: number }): unknown;
  loadFromJSON(json: Record<string, unknown>): Promise<unknown>;
  getObjects(): LoadableObject[];
  requestRenderAll(): unknown;
};

function invalid(message: string): never {
  throw new ImageEditorError("DOCUMENT_INVALID", message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateCanvas(value: unknown): asserts value is ImageEditorCanvas {
  if (!isRecord(value)) invalid("文档缺少有效画布信息");
  if (!Number.isFinite(value.width) || Number(value.width) <= 0) invalid("画布宽度无效");
  if (!Number.isFinite(value.height) || Number(value.height) <= 0) invalid("画布高度无效");
  if (value.background !== null && typeof value.background !== "string") {
    invalid("画布背景无效");
  }
}

function validateObject(value: unknown): asserts value is EditorObject {
  if (!isRecord(value)) invalid("对象数据无效");
  if (typeof value.id !== "string" || value.id.length === 0) invalid("对象 ID 无效");
  if (typeof value.type !== "string" || !SUPPORTED_TYPES.has(value.type as EditorObjectType)) {
    invalid("对象类型无效");
  }
  if (typeof value.name !== "string" || value.name.length === 0) invalid("对象名称无效");
  if (typeof value.locked !== "boolean") invalid("对象锁定状态无效");
  if (typeof value.visible !== "boolean") invalid("对象显示状态无效");
  if (!isRecord(value.fabricData)) invalid("Fabric 对象数据无效");
}

export function validateDocument(value: unknown): asserts value is ImageEditorDocument {
  if (!isRecord(value)) invalid("文档格式无效");
  if (value.version !== 1) {
    throw new ImageEditorError("DOCUMENT_VERSION_UNSUPPORTED", "不支持的文档版本");
  }
  validateCanvas(value.canvas);
  if (!Array.isArray(value.objects)) invalid("文档对象列表无效");
  const ids = new Set<string>();
  for (const object of value.objects) {
    validateObject(object);
    if (ids.has(object.id)) invalid("对象 ID 必须唯一");
    ids.add(object.id);
  }
}

export function serializeCanvas(
  canvas: SerializableCanvas,
  canvasState: ImageEditorCanvas,
): ImageEditorDocument {
  const objects = canvas.getObjects().map<EditorObject>((object) => {
    const fabricData = { ...object.toObject([...SERIALIZED_EDITOR_PROPERTIES]) };
    delete fabricData.id;
    delete fabricData.editorType;
    delete fabricData.name;
    delete fabricData.editorLocked;
    delete fabricData.visible;
    return {
      id: object.id,
      type: object.editorType,
      name: object.name,
      locked: Boolean(object.editorLocked),
      visible: object.visible !== false,
      fabricData,
    };
  });

  return {
    version: 1,
    canvas: { ...canvasState },
    objects,
  };
}

export async function loadDocumentIntoCanvas(
  canvas: LoadableCanvas,
  value: unknown,
): Promise<ImageEditorDocument> {
  validateDocument(value);
  const document = structuredClone(value);
  canvas.setDimensions({
    width: document.canvas.width,
    height: document.canvas.height,
  });
  canvas.backgroundColor = document.canvas.background ?? "rgba(0,0,0,0)";
  await canvas.loadFromJSON({
    version: "7.0.0",
    objects: document.objects.map((object) => ({
      ...object.fabricData,
      id: object.id,
      editorType: object.type,
      name: object.name,
      editorLocked: object.locked,
      visible: object.visible,
    })),
  });

  for (const object of canvas.getObjects()) {
    applyEditorLocked(object as unknown as EditableFabricObject, Boolean(object.editorLocked));
  }
  canvas.requestRenderAll();
  return document;
}

export function toEditableFabricObject(object: FabricObject): EditableFabricObject {
  return object as EditableFabricObject;
}
