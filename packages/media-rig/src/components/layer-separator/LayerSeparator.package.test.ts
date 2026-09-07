import { describe, expect, it } from "vitest";
import { LayerSeparator, buildLayerSeparatorPrompt } from "../../index";

describe("LayerSeparator package surface", () => {
  it("exports the component and prompt adapter", () => {
    expect(LayerSeparator).toBeTypeOf("function");
    expect(buildLayerSeparatorPrompt([])).toContain("transparent layers");
  });
});
