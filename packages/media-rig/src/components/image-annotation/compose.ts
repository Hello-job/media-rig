export async function composeImageWithAnnotation(
  sourceImageUrl: string,
  annotationCanvas: HTMLCanvasElement,
) {
  const response = await fetch(sourceImageUrl);
  if (!response.ok) {
    throw new Error("图片加载失败");
  }

  const blobUrl = URL.createObjectURL(await response.blob());
  try {
    const source = new Image();
    source.src = blobUrl;
    await source.decode();

    const output = document.createElement("canvas");
    output.width = source.naturalWidth || source.width;
    output.height = source.naturalHeight || source.height;
    const context = output.getContext("2d");
    if (!context) {
      throw new Error("标注合成失败");
    }

    context.drawImage(source, 0, 0, output.width, output.height);
    context.drawImage(
      annotationCanvas,
      0,
      0,
      annotationCanvas.width,
      annotationCanvas.height,
      0,
      0,
      output.width,
      output.height,
    );

    const result = await new Promise<Blob | null>((resolve) =>
      output.toBlob(resolve, "image/png"),
    );
    if (!result) {
      throw new Error("标注导出失败");
    }
    return result;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
