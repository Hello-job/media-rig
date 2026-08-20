import { fireEvent, render } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useEditorKeyboard } from "./useEditorKeyboard";

function Harness({ actions }: { actions: Record<string, any> }) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEditorKeyboard(rootRef, null, actions as never);
  return (
    <div ref={rootRef} tabIndex={-1} data-testid="root">
      <input data-testid="input" />
    </div>
  );
}

function actions() {
  return {
    undo: vi.fn(),
    redo: vi.fn(),
    duplicateSelection: vi.fn(),
    deleteSelection: vi.fn(),
    clearSelection: vi.fn(),
    setSnapDisabled: vi.fn(),
  };
}

describe("useEditorKeyboard", () => {
  it("runs editor shortcuts while focus belongs to the editor", () => {
    const handlers = actions();
    const view = render(<Harness actions={handlers} />);
    const root = view.getByTestId("root");
    root.focus();
    fireEvent.keyDown(window, { key: "z", metaKey: true });
    fireEvent.keyDown(window, { key: "d", metaKey: true });
    fireEvent.keyDown(window, { key: "Delete" });
    fireEvent.keyDown(window, { key: "Escape" });
    expect(handlers.undo).toHaveBeenCalledOnce();
    expect(handlers.duplicateSelection).toHaveBeenCalledOnce();
    expect(handlers.deleteSelection).toHaveBeenCalledOnce();
    expect(handlers.clearSelection).toHaveBeenCalledOnce();
  });

  it("does not run shortcuts while editing an input", () => {
    const handlers = actions();
    const view = render(<Harness actions={handlers} />);
    view.getByTestId("input").focus();
    fireEvent.keyDown(window, { key: "z", metaKey: true });
    fireEvent.keyDown(window, { key: "Delete" });
    expect(handlers.undo).not.toHaveBeenCalled();
    expect(handlers.deleteSelection).not.toHaveBeenCalled();
  });

  it("toggles temporary snap disable with Alt", () => {
    const handlers = actions();
    const view = render(<Harness actions={handlers} />);
    view.getByTestId("root").focus();
    fireEvent.keyDown(window, { key: "Alt" });
    fireEvent.keyUp(window, { key: "Alt" });
    expect(handlers.setSnapDisabled).toHaveBeenNthCalledWith(1, true);
    expect(handlers.setSnapDisabled).toHaveBeenNthCalledWith(2, false);
  });
});
