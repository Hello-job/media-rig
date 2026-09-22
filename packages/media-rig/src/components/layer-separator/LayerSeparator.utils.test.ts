import { describe, expect, it } from "vitest";
import {
  buildLayerSeparatorPrompt,
  isUsableSelection,
  normalizeTransform,
  scaleLayer,
  toBoundingBox,
} from "./LayerSeparator.utils";

describe("LayerSeparator utilities", () => {
  it("keeps an off-center subject fixed when scaling a rotated, flipped layer", () => {
    const layer = {
      id: "subject", url: "/subject.png",
      contentBounds: { x: 0.7, y: 0.5, width: 0.3, height: 0.4 },
      transform: { x: -0.1, y: 0.05, rotation: 90, flipX: true },
    };
    const scaled = scaleLayer(layer, 0.5);
    expect(scaled.x + 0.85 * scaled.width).toBeCloseTo(0.75);
    expect(scaled.y + 0.7 * scaled.height).toBeCloseTo(0.75);
    expect(scaled.rotation).toBe(90);
    expect(scaled.flipX).toBe(true);
    const restored = scaleLayer({ ...layer, transform: scaled }, 1);
    expect(restored.x).toBeCloseTo(-0.1);
    expect(restored.y).toBeCloseTo(0.05);
  });

  it("normalizes reversed selections to provider bounding boxes", () => {
    expect(toBoundingBox({ id: "subject", x1: 0.8, y1: 0.7, x2: 0.1, y2: 0.2 })).toEqual({
      x1: 100,
      y1: 200,
      x2: 800,
      y2: 700,
    });
  });

  it("builds automatic and selection-aware prompts", () => {
    expect(buildLayerSeparatorPrompt([])).toContain("main objects");
    expect(buildLayerSeparatorPrompt([{ x1: 10, y1: 20, x2: 300, y2: 400 }], "Keep the chair"))
      .toBe("Keep the chair\nSplit the objects within <bbox>10 20 300 400</bbox> into separate editable transparent layers, and keep the background as the base layer.");
  });

  it("rejects accidental clicks and fills transform defaults", () => {
    expect(isUsableSelection({ id: "tiny", x1: 0.1, y1: 0.1, x2: 0.105, y2: 0.6 })).toBe(false);
    expect(normalizeTransform({ x: 0.2, visible: false })).toEqual({
      x: 0.2,
      y: 0,
      width: 1,
      height: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      visible: false,
    });
  });
});
