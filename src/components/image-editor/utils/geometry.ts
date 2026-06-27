export type Size = { width: number; height: number };

export function clampZoom(value: number) {
  return Math.min(8, Math.max(0.1, value));
}

export function fitViewport(viewport: Size, canvas: Size, padding = 48) {
  const availableWidth = Math.max(1, viewport.width - padding * 2);
  const availableHeight = Math.max(1, viewport.height - padding * 2);
  return clampZoom(Math.min(availableWidth / canvas.width, availableHeight / canvas.height));
}

export function containSize(source: Size, target: Size) {
  const scale = Math.min(target.width / source.width, target.height / source.height);
  return { width: source.width * scale, height: source.height * scale, scale };
}

export function coverSize(source: Size, target: Size) {
  const scale = Math.max(target.width / source.width, target.height / source.height);
  return { width: source.width * scale, height: source.height * scale, scale };
}
