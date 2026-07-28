import { describe, expect, it } from "vitest";
import type { ImageEditorDocument } from "../ImageEditor.types";
import { HistoryManager } from "./HistoryManager";

function doc(name: string): ImageEditorDocument {
  return {
    version: 1,
    canvas: { width: 100, height: 100, background: name },
    objects: [],
  };
}

describe("HistoryManager", () => {
  it("undoes and redoes committed documents", () => {
    const history = new HistoryManager<ImageEditorDocument>(3);
    history.reset(doc("a"));
    history.commit(doc("b"));
    expect(history.undo()).toEqual(doc("a"));
    expect(history.redo()).toEqual(doc("b"));
  });

  it("drops redo entries after a new commit", () => {
    const history = new HistoryManager<ImageEditorDocument>(3);
    history.reset(doc("a"));
    history.commit(doc("b"));
    history.undo();
    history.commit(doc("c"));
    expect(history.canRedo).toBe(false);
  });

  it("keeps only the configured number of snapshots", () => {
    const history = new HistoryManager<ImageEditorDocument>(2);
    history.reset(doc("a"));
    history.commit(doc("b"));
    history.commit(doc("c"));
    expect(history.undo()).toEqual(doc("b"));
    expect(history.undo()).toBeNull();
  });

  it("ignores equal snapshots and clones returned values", () => {
    const history = new HistoryManager<ImageEditorDocument>(3);
    const original = doc("a");
    history.reset(original);
    history.commit(doc("a"));
    const current = history.current;
    current!.canvas.background = "mutated";
    expect(history.current).toEqual(doc("a"));
    expect(history.canUndo).toBe(false);
  });
});
