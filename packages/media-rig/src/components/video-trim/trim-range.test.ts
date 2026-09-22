import { describe, expect, it } from "vitest";
import { adjustVideoTrimRange } from "./trim-range";

describe("video trim selection", () => {
  it("moves without changing fractional length and clamps at both edges", () => {
    const move = (delta: number) =>
      adjustVideoTrimRange([1.25, 3.75], "move", delta, 6.8, false);
    expect(move(1)).toEqual([2.25, 4.75]);
    expect(move(-100)).toEqual([0, 2.5]);
    expect(move(100)[0]).toBeCloseTo(4.3);
    expect(move(100)[1]).toBe(6.8);
  });
  it("snaps absolute endpoints and preserves length when moving", () => {
    expect(adjustVideoTrimRange([1.25, 3.75], "start", 0.4, 6.8, true)).toEqual(
      [2, 3.75],
    );
    expect(adjustVideoTrimRange([1.25, 3.75], "end", 0.4, 6.8, true)).toEqual([
      1.25, 4,
    ]);
    expect(adjustVideoTrimRange([1.25, 3.75], "move", 0.4, 6.8, true)).toEqual([
      2, 4.5,
    ]);
  });
  it("prevents crossed endpoints and retains fractional video tail", () => {
    expect(adjustVideoTrimRange([1, 3], "start", 100, 6.8, false)).toEqual([
      2.9, 3,
    ]);
    expect(adjustVideoTrimRange([1, 3], "end", -100, 6.8, false)).toEqual([
      1, 1.1,
    ]);
    expect(adjustVideoTrimRange([1, 3], "end", 100, 6.8, true)).toEqual([
      1, 6.8,
    ]);
    expect(adjustVideoTrimRange([0, 0.05], "start", 1, 0.05, false)).toEqual([
      0, 0.05,
    ]);
  });
});
