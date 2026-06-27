import {
  Ellipse,
  Group,
  Line,
  Rect,
  Textbox,
  Triangle,
  type Canvas,
  type FabricObject,
} from "fabric";
import {
  applyEditorLocked,
  ensureEditorMetadata,
  type EditableFabricObject,
} from "../utils/editorObject";

function editable(object: FabricObject) {
  return object as EditableFabricObject;
}

export function createEditorCommands(canvas: Canvas) {
  const selected = () => canvas.getActiveObjects().map(editable);

  const addObject = <T extends FabricObject>(
    object: T,
    type: EditableFabricObject["editorType"],
    name: string,
  ) => {
    const next = ensureEditorMetadata(object, type, name);
    canvas.add(next);
    canvas.centerObject(next);
    next.setCoords();
    canvas.setActiveObject(next);
    canvas.requestRenderAll();
    return next.id;
  };

  const mutateSelection = (mutation: (object: EditableFabricObject) => void) => {
    const objects = selected();
    if (objects.length === 0) return false;
    for (const object of objects) {
      mutation(object);
      object.setCoords();
    }
    canvas.requestRenderAll();
    return true;
  };

  return {
    addText(text = "双击编辑文本") {
      return addObject(
        new Textbox(text, {
          width: 360,
          fontSize: 48,
          fontFamily: "Geist Variable, sans-serif",
          fill: "#111111",
          textAlign: "center",
          originX: "center",
          originY: "center",
        }),
        "text",
        "文本",
      );
    },
    addRect() {
      return addObject(
        new Rect({
          width: 240,
          height: 160,
          fill: "#4b9eff",
          stroke: "transparent",
          originX: "center",
          originY: "center",
        }),
        "rect",
        "矩形",
      );
    },
    addEllipse() {
      return addObject(
        new Ellipse({
          rx: 120,
          ry: 80,
          fill: "#4b9eff",
          stroke: "transparent",
          originX: "center",
          originY: "center",
        }),
        "ellipse",
        "椭圆",
      );
    },
    addLine() {
      return addObject(
        new Line([-120, 0, 120, 0], {
          stroke: "#111111",
          strokeWidth: 4,
          originX: "center",
          originY: "center",
        }),
        "line",
        "直线",
      );
    },
    addArrow() {
      const line = new Line([-120, 0, 105, 0], { stroke: "#111111", strokeWidth: 4 });
      const head = new Triangle({
        width: 24,
        height: 28,
        fill: "#111111",
        angle: 90,
        left: 120,
        top: 0,
        originX: "center",
        originY: "center",
      });
      return addObject(
        new Group([line, head], { originX: "center", originY: "center" }),
        "arrow",
        "箭头",
      );
    },
    async duplicateSelection() {
      const objects = selected();
      if (objects.length === 0) return false;
      const clones = await Promise.all(objects.map((object) => object.clone()));
      for (let index = 0; index < clones.length; index += 1) {
        const source = objects[index];
        const clone = ensureEditorMetadata(
          clones[index],
          source.editorType,
          `${source.name} 副本`,
        );
        clone.set({
          left: (source.left ?? 0) + 20,
          top: (source.top ?? 0) + 20,
        });
        canvas.add(clone);
        clone.setCoords();
      }
      canvas.setActiveObject(clones[clones.length - 1]);
      canvas.requestRenderAll();
      return true;
    },
    deleteSelection() {
      const objects = selected();
      if (objects.length === 0) return false;
      canvas.remove(...objects);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      return true;
    },
    toggleLock() {
      return mutateSelection((object) => applyEditorLocked(object, !object.editorLocked));
    },
    toggleVisibility() {
      return mutateSelection((object) => object.set({ visible: object.visible === false }));
    },
    bringForward() {
      return mutateSelection((object) => {
        canvas.bringObjectForward(object);
      });
    },
    sendBackward() {
      return mutateSelection((object) => {
        canvas.sendObjectBackwards(object);
      });
    },
    bringToFront() {
      return mutateSelection((object) => {
        canvas.bringObjectToFront(object);
      });
    },
    sendToBack() {
      return mutateSelection((object) => {
        canvas.sendObjectToBack(object);
      });
    },
    alignHorizontalCenter() {
      return mutateSelection((object) => object.set({ left: canvas.getWidth() / 2 }));
    },
    alignVerticalCenter() {
      return mutateSelection((object) => object.set({ top: canvas.getHeight() / 2 }));
    },
    alignCenter() {
      return mutateSelection((object) => {
        canvas.centerObject(object);
      });
    },
  };
}

export type EditorCommands = ReturnType<typeof createEditorCommands>;
