import type { Canvas } from "fabric";
import type { RefObject } from "react";
import { useEffect } from "react";

export type KeyboardActions = {
  undo(): void;
  redo(): void;
  duplicateSelection(): void | Promise<boolean>;
  deleteSelection(): void;
  clearSelection(): void;
  setSnapDisabled(disabled: boolean): void;
};

function isTextInput(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export function useEditorKeyboard(
  rootRef: RefObject<HTMLElement | null>,
  canvas: Canvas | null,
  actions: KeyboardActions,
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const root = rootRef.current;
      const ownsFocus = Boolean(root && root.contains(document.activeElement));
      if (
        !ownsFocus ||
        isTextInput(event.target) ||
        isTextInput(document.activeElement) ||
        (canvas?.getActiveObject() as any)?.isEditing
      ) return;
      if (event.key === "Alt") actions.setSnapDisabled(true);
      const command = event.metaKey || event.ctrlKey;
      if (command && event.key.toLowerCase() === "z") {
        event.preventDefault();
        event.shiftKey ? actions.redo() : actions.undo();
      } else if (command && event.key.toLowerCase() === "y") {
        event.preventDefault();
        actions.redo();
      } else if (command && event.key.toLowerCase() === "d") {
        event.preventDefault();
        void actions.duplicateSelection();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        actions.deleteSelection();
      } else if (event.key === "Escape") {
        actions.clearSelection();
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Alt") actions.setSnapDisabled(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [actions, canvas, rootRef]);
}
