import { Rect } from "fabric";
import { describe, expect, it, vi } from "vitest";
import { createEditorCommands } from "./EditorCommands";

function canvasDouble(objects: any[] = []) {
  return {
    width: 1000,
    height: 800,
    getWidth: () => 1000,
    getHeight: () => 800,
    add: vi.fn((object: any) => objects.push(object)),
    remove: vi.fn((...targets: any[]) => {
      targets.forEach((target) => objects.splice(objects.indexOf(target), 1));
    }),
    centerObject: vi.fn((object: any) => object.set({ left: 500, top: 400 })),
    setActiveObject: vi.fn(),
    discardActiveObject: vi.fn(),
    getActiveObjects: vi.fn(() => objects.slice(0, 1)),
    getObjects: vi.fn(() => objects),
    requestRenderAll: vi.fn(),
    bringObjectForward: vi.fn(() => true),
    sendObjectBackwards: vi.fn(() => true),
    bringObjectToFront: vi.fn(() => true),
    sendObjectToBack: vi.fn(() => true),
  };
}

describe("EditorCommands", () => {
  it("adds centered text with stable editor metadata", () => {
    const canvas = canvasDouble();
    const commands = createEditorCommands(canvas as never);
    const id = commands.addText("你好");
    const object = canvas.add.mock.calls[0][0];
    expect(id).toBe(object.id);
    expect(object).toMatchObject({ editorType: "text", name: "文本", text: "你好" });
    expect(canvas.centerObject).toHaveBeenCalledWith(object);
    expect(canvas.setActiveObject).toHaveBeenCalledWith(object);
  });

  it("creates every basic shape type", () => {
    const canvas = canvasDouble();
    const commands = createEditorCommands(canvas as never);
    commands.addRect();
    commands.addEllipse();
    commands.addLine();
    commands.addArrow();
    expect(canvas.add.mock.calls.map(([object]) => object.editorType)).toEqual([
      "rect",
      "ellipse",
      "line",
      "arrow",
    ]);
  });

  it("duplicates selected objects with fresh ids and offsets", async () => {
    const source = new Rect({ left: 20, top: 30, width: 100, height: 100 });
    Object.assign(source, {
      id: "source",
      editorType: "rect",
      name: "矩形 1",
      editorLocked: false,
    });
    const canvas = canvasDouble([source]);
    const commands = createEditorCommands(canvas as never);
    const changed = await commands.duplicateSelection();
    const clone = canvas.add.mock.calls[0][0];
    expect(changed).toBe(true);
    expect(clone.id).not.toBe("source");
    expect(clone).toMatchObject({ left: 40, top: 50, editorType: "rect" });
  });

  it("locks, hides, centers, reorders, and deletes the active selection", () => {
    const object = new Rect({ left: 10, top: 20, width: 100, height: 50 });
    Object.assign(object, {
      id: "shape",
      editorType: "rect",
      name: "矩形",
      editorLocked: false,
    });
    const canvas = canvasDouble([object]);
    const commands = createEditorCommands(canvas as never);
    expect(commands.toggleLock()).toBe(true);
    expect(object).toMatchObject({ editorLocked: true, selectable: false, evented: false });
    expect(commands.toggleVisibility()).toBe(true);
    expect(object.visible).toBe(false);
    expect(commands.alignCenter()).toBe(true);
    expect(object.left).toBe(500);
    expect(object.top).toBe(400);
    expect(commands.bringForward()).toBe(true);
    expect(canvas.bringObjectForward).toHaveBeenCalledWith(object);
    expect(commands.deleteSelection()).toBe(true);
    expect(canvas.remove).toHaveBeenCalledWith(object);
  });
});
