import type {
  LayerSeparatorAsset,
  LayerSeparatorBoundingBox,
  LayerSeparatorResult,
  LayerSeparatorSelection,
  LayerSeparatorTransform,
} from "./LayerSeparator.types";

const COORDINATE_MAX = 999;

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function isUsableSelection(selection: LayerSeparatorSelection) {
  return (
    Math.abs(selection.x2 - selection.x1) >= 0.015 &&
    Math.abs(selection.y2 - selection.y1) >= 0.015
  );
}

export function toBoundingBox(
  selection: LayerSeparatorSelection,
): LayerSeparatorBoundingBox {
  const normalize = (value: number) =>
    Math.min(COORDINATE_MAX, Math.max(0, Math.round(clamp(value) * 1000)));
  return {
    x1: normalize(Math.min(selection.x1, selection.x2)),
    y1: normalize(Math.min(selection.y1, selection.y2)),
    x2: normalize(Math.max(selection.x1, selection.x2)),
    y2: normalize(Math.max(selection.y1, selection.y2)),
  };
}

export function buildLayerSeparatorPrompt(
  boxes: LayerSeparatorBoundingBox[],
  instruction = "",
) {
  const target = boxes.length
    ? `the objects within ${boxes
        .map((box) => `<bbox>${box.x1} ${box.y1} ${box.x2} ${box.y2}</bbox>`)
        .join(" and ")}`
    : "the main objects in the image";
  const base = `Split ${target} into separate editable transparent layers, and keep the background as the base layer.`;
  const detail = instruction.trim();
  return detail ? `${detail}\n${base}` : base;
}

export function normalizeTransform(
  transform: Partial<LayerSeparatorTransform> | undefined,
): LayerSeparatorTransform {
  return {
    x: clamp(transform?.x ?? 0, -1, 1),
    y: clamp(transform?.y ?? 0, -1, 1),
    width: clamp(transform?.width ?? 1, 0.04, 2),
    height: clamp(transform?.height ?? 1, 0.04, 2),
    rotation: Number.isFinite(transform?.rotation) ? transform!.rotation! : 0,
    flipX: transform?.flipX ?? false,
    flipY: transform?.flipY ?? false,
    visible: transform?.visible ?? true,
  };
}

export function normalizeResult(result: LayerSeparatorResult) {
  return {
    ...result,
    layers: result.layers.map((layer) => ({
      ...layer,
      transform: normalizeTransform(layer.transform),
    })),
  } satisfies LayerSeparatorResult;
}

/** Resize around the visible subject, including layers with transparent margins. */
export function scaleLayer(layer: LayerSeparatorAsset, requestedWidth: number) {
  const transform = normalizeTransform(layer.transform);
  const bounds = layer.contentBounds ?? { x: 0, y: 0, width: 1, height: 1 };
  const ratio = clamp(requestedWidth / transform.width,
    Math.max(0.04 / transform.width, 0.04 / transform.height),
    Math.min(2 / transform.width, 2 / transform.height));
  const width = transform.width * ratio;
  const height = transform.height * ratio;
  return {
    ...transform,
    x: transform.x + (bounds.x + bounds.width / 2) * (transform.width - width),
    y: transform.y + (bounds.y + bounds.height / 2) * (transform.height - height),
    width,
    height,
  };
}

async function loadImage(url: string) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = url;
  await image.decode();
  return image;
}

export async function composeLayerSeparatorResult(result: LayerSeparatorResult) {
  const background = await loadImage(result.background.url);
  const canvas = document.createElement("canvas");
  canvas.width = background.naturalWidth || background.width;
  canvas.height = background.naturalHeight || background.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create the layer composition canvas.");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(background, 0, 0, canvas.width, canvas.height);

  for (const layer of result.layers) {
    const transform = normalizeTransform(layer.transform);
    if (!transform.visible) continue;
    const image = await loadImage(layer.url);
    const width = transform.width * canvas.width;
    const height = transform.height * canvas.height;
    const bounds = layer.contentBounds ?? { x: 0, y: 0, width: 1, height: 1 };
    const originX = bounds.x + bounds.width / 2;
    const originY = bounds.y + bounds.height / 2;
    const centerX = (transform.x + originX * transform.width) * canvas.width;
    const centerY = (transform.y + originY * transform.height) * canvas.height;
    context.save();
    context.translate(centerX, centerY);
    context.rotate((transform.rotation * Math.PI) / 180);
    context.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1);
    context.drawImage(image, -originX * width, -originY * height, width, height);
    context.restore();
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Unable to export the merged image."));
    }, "image/png");
  });
}
