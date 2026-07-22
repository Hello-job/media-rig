import { describe, expect, it } from "vitest";
import {
  componentHref,
  findComponent,
  mediaComponents,
  resolveComponentFromLocation,
} from "./catalog";

describe("component catalog", () => {
  it("publishes every component with a unique route", () => {
    expect(mediaComponents).toHaveLength(3);
    expect(new Set(mediaComponents.map((component) => component.slug)).size).toBe(3);
    expect(mediaComponents.every((component) => component.api.length > 0)).toBe(true);
  });

  it("resolves canonical and legacy preview URLs", () => {
    expect(resolveComponentFromLocation("?component=image-angle-rig")?.slug).toBe("image-angle-rig");
    expect(resolveComponentFromLocation("?demo=light")?.slug).toBe("light-sphere");
    expect(findComponent("director-stage")?.legacyDemo).toBe("director");
    expect(componentHref("director-stage")).toBe("?component=director-stage");
  });
});
