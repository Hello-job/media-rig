import { describe, expect, it } from "vitest";
import {
  buildLayerSeparatorPrompt,
  isUsableSelection,
  normalizeTransform,
  toBoundingBox,
} from "./LayerSeparator.utils";

describe("LayerSeparator utilities", () => {
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
