import { describe, expect, it } from "vitest";
import { calculateSnapPosition } from "./SnapGuides";

describe("calculateSnapPosition", () => {
  it("snaps an object center to the canvas center", () => {
    expect(
      calculateSnapPosition(
        { left: 444, top: 350, width: 100, height: 100 },
        [],
        { width: 1000, height: 800 },
        6,
      ),
    ).toMatchObject({ left: 450, top: 350, verticalGuide: 500 });
  });

  it("snaps object edges and scales the threshold by zoom", () => {
    expect(
      calculateSnapPosition(
        { left: 203, top: 100, width: 50, height: 50 },
        [{ left: 100, top: 100, width: 100, height: 50 }],
        { width: 1000, height: 800 },
        3,
      ),
    ).toMatchObject({ left: 200, horizontalGuide: 125 });
  });

  it("returns unchanged coordinates when snapping is disabled", () => {
    expect(
      calculateSnapPosition(
        { left: 444, top: 350, width: 100, height: 100 },
        [],
        { width: 1000, height: 800 },
        6,
        true,
      ),
    ).toEqual({ left: 444, top: 350 });
  });
});
