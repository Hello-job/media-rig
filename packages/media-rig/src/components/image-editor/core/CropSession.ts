import type { FabricImage } from "fabric";

type CropSnapshot = Pick<
  FabricImage,
  "cropX" | "cropY" | "width" | "height" | "scaleX" | "scaleY" | "left" | "top"
>;

function snapshot(image: FabricImage): CropSnapshot {
  return {
    cropX: image.cropX,
    cropY: image.cropY,
    width: image.width,
    height: image.height,
    scaleX: image.scaleX,
    scaleY: image.scaleY,
    left: image.left,
    top: image.top,
  };
}

export class CropSession {
  private readonly initial: CropSnapshot;
  private finished = false;

  private constructor(private readonly image: FabricImage) {
    this.initial = snapshot(image);
  }

  static start(image: FabricImage) {
    return new CropSession(image);
  }

  pan(deltaX: number, deltaY: number) {
    if (this.finished) return;
    const element = this.image.getElement() as HTMLImageElement;
    const sourceWidth = element.naturalWidth || element.width;
    const sourceHeight = element.naturalHeight || element.height;
    this.image.set({
      cropX: Math.min(Math.max(0, this.image.cropX + deltaX), Math.max(0, sourceWidth - this.image.width)),
      cropY: Math.min(Math.max(0, this.image.cropY + deltaY), Math.max(0, sourceHeight - this.image.height)),
    });
    this.image.setCoords();
  }

  zoom(factor: number) {
    if (this.finished || !Number.isFinite(factor) || factor <= 0) return;
    const element = this.image.getElement() as HTMLImageElement;
    const sourceWidth = element.naturalWidth || element.width;
    const sourceHeight = element.naturalHeight || element.height;
    this.image.set({
      width: Math.min(sourceWidth, Math.max(1, this.initial.width / factor)),
      height: Math.min(sourceHeight, Math.max(1, this.initial.height / factor)),
    });
    this.pan(0, 0);
  }

  cancel() {
    if (this.finished) return;
    this.image.set(this.initial);
    this.image.setCoords();
    this.finished = true;
  }

  confirm() {
    if (this.finished) return { changed: false };
    const changed = JSON.stringify(snapshot(this.image)) !== JSON.stringify(this.initial);
    this.finished = true;
    return { changed };
  }
}
