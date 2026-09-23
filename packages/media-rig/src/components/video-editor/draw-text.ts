import type { TextClip } from "./types";

/** Shared by preview and exported PNG overlays, including system CJK font fallback. */
export function drawEditText(
  ctx: CanvasRenderingContext2D,
  clip: TextClip,
  width: number,
  height: number,
) {
  ctx.save();
  const fontSize = (clip.fontSize * height) / 1080;
  ctx.font = `${clip.italic ? "italic " : ""}${clip.bold === false ? 400 : 600} ${fontSize}px sans-serif`;
  ctx.textAlign = clip.align ?? "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = clip.color;
  const lines = clip.text.split("\n");
  if (clip.textType === "subtitle") {
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = Math.max(1, fontSize / 12);
    ctx.lineJoin = "round";
  }
  lines.forEach((line, i) => {
    if (clip.textType === "subtitle")
      ctx.strokeText(
        line,
        clip.x * width,
        clip.y * height + (i - (lines.length - 1) / 2) * fontSize * 1.25,
        width * 0.95,
      );
    ctx.fillText(
      line,
      clip.x * width,
      clip.y * height + (i - (lines.length - 1) / 2) * fontSize * 1.25,
      width * 0.95,
    );
  });
  ctx.restore();
}
export async function textOverlay(
  clip: TextClip | TextClip[],
  width: number,
  height: number,
) {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  for (const item of Array.isArray(clip) ? clip : [clip])
    drawEditText(ctx, item, width, height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Text rendering failed"))),
      "image/png",
    ),
  );
  return new Uint8Array(await blob.arrayBuffer());
}

export function editTextBounds(clip: TextClip, width: number, height: number) {
  const ctx = document.createElement("canvas").getContext("2d");
  const font = (clip.fontSize * height) / 1080;
  if (ctx)
    ctx.font = `${clip.italic ? "italic " : ""}${clip.bold === false ? 400 : 600} ${font}px sans-serif`;
  const lines = clip.text.split("\n");
  const w = Math.min(
    width * 0.95,
    Math.max(
      font,
      ...lines.map((line) => ctx?.measureText(line).width ?? font),
    ),
  );
  const h = font * 1.25 * lines.length;
  let left = clip.x * width - w / 2;
  if (clip.align === "left") left = clip.x * width;
  if (clip.align === "right") left = clip.x * width - w;
  return { x: left, y: clip.y * height - h / 2, width: w, height: h };
}
