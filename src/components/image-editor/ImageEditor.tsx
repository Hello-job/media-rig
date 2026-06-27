import { forwardRef } from "react";
import type { ImageEditorHandle, ImageEditorProps } from "./ImageEditor.types";

const ImageEditor = forwardRef<ImageEditorHandle, ImageEditorProps>(function ImageEditor(
  { className, style },
  _ref,
) {
  return (
    <section
      className={["image-editor", className].filter(Boolean).join(" ")}
      style={style}
      role="application"
      aria-label="图片编辑器"
    />
  );
});

export default ImageEditor;
