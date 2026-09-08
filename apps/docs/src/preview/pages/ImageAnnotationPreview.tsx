import { useState } from "react";
import { ImageAnnotation } from "media-rig";

export default function ImageAnnotationPreview() {
  const [message, setMessage] = useState("");
  return <div className="w-full">
    <ImageAnnotation imageUrl="/assets/layer-separator/scene.png" imageAlt="暖光室内场景" onSave={(blob) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "annotated-image.png";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("已导出原图尺寸的 PNG 图片");
    }} />
    {message && <p role="status" className="mt-3 text-center text-xs text-white/50">{message}</p>}
  </div>;
}
