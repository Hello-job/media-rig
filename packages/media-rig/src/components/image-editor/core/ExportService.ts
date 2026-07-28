import type { Canvas } from "fabric";
import { ImageEditorError, type ExportOptions, type ImageEditorDocument } from "../ImageEditor.types";

export async function exportCanvas(
  canvas: Canvas,
  document: ImageEditorDocument,
  options: ExportOptions = {},
): Promise<Blob> {
  const format = options.format ?? "png";
  const quality = Math.min(1, Math.max(0, options.quality ?? 1));
  const multiplier = options.width
    ? options.width / document.canvas.width
    : options.height
      ? options.height / document.canvas.height
      : 1;
  const active = canvas.getActiveObject();
  const background = canvas.backgroundColor;

  try {
    canvas.discardActiveObject();
    if (format === "png" && options.transparent) {
      canvas.backgroundColor = "rgba(0,0,0,0)";
    } else if (format === "jpeg" && document.canvas.background === null) {
      canvas.backgroundColor = "#ffffff";
    }
    canvas.requestRenderAll();
    const dataUrl = canvas.toDataURL({ format, quality, multiplier });
    const response = await fetch(dataUrl);
    if (!response.ok) throw new Error(`Export response ${response.status}`);
    return await response.blob();
  } catch (error) {
    if (error instanceof DOMException && error.name === "SecurityError") {
      throw new ImageEditorError("EXPORT_CORS_FAILED", "跨域图片导致画布无法导出", error);
    }
    if (error instanceof ImageEditorError) throw error;
    throw new ImageEditorError("EXPORT_FAILED", "图片导出失败", error);
  } finally {
    canvas.backgroundColor = background;
    if (active) canvas.setActiveObject(active);
    canvas.requestRenderAll();
  }
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
