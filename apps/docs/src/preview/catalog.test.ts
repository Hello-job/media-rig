import { describe, expect, it } from "vitest";
import {
  componentHref,
  findComponent,
  mediaComponents,
  resolveComponentFromLocation,
} from "./catalog";

describe("component catalog", () => {
  it("publishes every component with a unique route", () => {
    expect(mediaComponents).toHaveLength(4);
    expect(new Set(mediaComponents.map((component) => component.slug)).size).toBe(4);
    expect(mediaComponents.every((component) => component.api.length > 0)).toBe(true);
  });

  it("resolves canonical and legacy preview URLs", () => {
    expect(resolveComponentFromLocation("?component=image-angle-rig")?.slug).toBe("image-angle-rig");
    expect(resolveComponentFromLocation("", "/components/image-editor")?.slug).toBe("image-editor");
    expect(resolveComponentFromLocation("?demo=light")?.slug).toBe("light-sphere");
    expect(resolveComponentFromLocation("?demo=editor")?.slug).toBe("image-editor");
    expect(findComponent("director-stage")?.legacyDemo).toBe("director");
    expect(componentHref("director-stage")).toBe("/components/director-stage");
  });
});
