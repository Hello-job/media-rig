import { FabricImage, type Canvas } from "fabric";
import { DEFAULT_MAX_IMAGE_SIZE } from "../ImageEditor.constants";
import { ImageEditorError } from "../ImageEditor.types";
import { ensureEditorMetadata, type EditableFabricObject } from "../utils/editorObject";
import { containSize, coverSize } from "../utils/geometry";

const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export function validateImageFile(file: File, maxSize = DEFAULT_MAX_IMAGE_SIZE) {
  if (!IMAGE_TYPES.has(file.type)) {
    throw new ImageEditorError("UNSUPPORTED_FILE", "不支持的图片格式");
  }
  if (file.size > maxSize) {
    const megabytes = Math.round(maxSize / 1024 / 1024);
    throw new ImageEditorError("FILE_TOO_LARGE", `图片不能超过 ${megabytes} MB`);
  }
}

export function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new ImageEditorError("IMAGE_DECODE_FAILED", "读取图片失败", reader.error));
    reader.readAsDataURL(file);
  });
}

export async function resolveImageSource(source: File | string, maxSize = DEFAULT_MAX_IMAGE_SIZE) {
  if (typeof source === "string") return source;
  validateImageFile(source, maxSize);
  return fileToDataUrl(source);
}

export async function addImageToCanvas(
  canvas: Canvas,
  source: File | string,
  maxSize = DEFAULT_MAX_IMAGE_SIZE,
) {
  const url = await resolveImageSource(source, maxSize);
  let image: FabricImage;
  try {
    image = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
  } catch (error) {
    throw new ImageEditorError(
      typeof source === "string" ? "IMAGE_CORS_FAILED" : "IMAGE_DECODE_FAILED",
      "图片加载失败",
      error,
    );
  }
  const editable = ensureEditorMetadata(image, "image", "图片");
  const size = containSize(
    { width: image.width || 1, height: image.height || 1 },
    { width: canvas.getWidth() * 0.8, height: canvas.getHeight() * 0.8 },
  );
  editable.set({ scaleX: size.scale, scaleY: size.scale });
  canvas.add(editable);
  canvas.centerObject(editable);
  editable.setCoords();
  canvas.setActiveObject(editable);
  canvas.requestRenderAll();
  return editable.id;
}

export function fitImageToCanvas(
  image: FabricImage,
  canvas: Pick<Canvas, "getWidth" | "getHeight" | "centerObject">,
  mode: "contain" | "cover",
) {
  const calculator = mode === "contain" ? containSize : coverSize;
  const size = calculator(
    { width: image.width || 1, height: image.height || 1 },
    { width: canvas.getWidth(), height: canvas.getHeight() },
  );
  image.set({ scaleX: size.scale, scaleY: size.scale });
  canvas.centerObject?.(image);
  image.setCoords();
}

export function flipImage(image: FabricImage, axis: "x" | "y") {
  image.set(axis === "x" ? { flipX: !image.flipX } : { flipY: !image.flipY });
  image.setCoords();
}

export async function replaceImageSource(image: FabricImage, source: File | string, maxSize?: number) {
  const url = await resolveImageSource(source, maxSize);
  const replacement = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
  const displayedWidth = image.getScaledWidth();
  const displayedHeight = image.getScaledHeight();
  image.setElement(replacement.getElement());
  image.set({
    width: replacement.width,
    height: replacement.height,
    cropX: 0,
    cropY: 0,
    scaleX: displayedWidth / Math.max(1, replacement.width),
    scaleY: displayedHeight / Math.max(1, replacement.height),
  });
  image.setCoords();
  return image as FabricImage & EditableFabricObject;
}
