import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDirectorStage } from "./hooks/useDirectorStage";
import { parseSceneSeed } from "./DirectorStage.utils";

describe("DirectorStage scene editing", () => {
  it("preserves an explicitly empty composition", () => {
    const { result } = renderHook(() => useDirectorStage({ characters: [], props: [], cameras: [] }, false));
    expect(result.current.state.composition.characters).toEqual([]);
    expect(result.current.state.composition.props).toEqual([]);
    expect(result.current.state.composition.cameras).toEqual([]);
  });
  it("previews the selected camera rather than resetting to the first", () => {
    const { result } = renderHook(() => useDirectorStage(undefined, false));
    act(() => result.current.dispatch({ type: "addCamera" }));
    const id = result.current.state.activeCameraId;
    act(() => result.current.dispatch({ type: "setViewMode", mode: "camera" }));
    expect(result.current.state.activeCameraId).toBe(id);
  });
  it("preserves unspecified joint axes on partial seed import", () => {
    const { result } = renderHook(() => useDirectorStage(undefined, false));
    act(() => result.current.dispatch({ type: "importSeed", seed: parseSceneSeed('{"characters":[{"jointAngles":{"head":{"nod":20}}}]}') }));
    expect(result.current.state.composition.characters[0].jointAngles.head).toEqual({ nod: 20, turn: 0 });
  });
  it.each(['null', '[]', '{"characters":{}}', '{"props":[null]}', '{"cameras":[{"position":{"x":"oops"}}]}', '{"environment":{"groundOpacity":2}}'])('rejects malformed seeds before dispatch: %s', (seed) => {
    expect(() => parseSceneSeed(seed)).toThrow();
  });
});
