import type { FabricObject } from "fabric";
import type { EditorObjectType } from "../ImageEditor.types";

export type EditableFabricObject = FabricObject & {
  id: string;
  editorType: EditorObjectType;
  name: string;
  editorLocked: boolean;
};

export const SERIALIZED_EDITOR_PROPERTIES = [
  "id",
  "editorType",
  "name",
  "editorLocked",
] as const;

export function ensureEditorMetadata(
  object: FabricObject,
  type: EditorObjectType,
  name: string,
  id = crypto.randomUUID(),
): EditableFabricObject {
  return Object.assign(object, {
    id,
    editorType: type,
    name,
    editorLocked: false,
  });
}

export function applyEditorLocked(object: EditableFabricObject, locked: boolean) {
  object.editorLocked = locked;
  object.set({
    selectable: !locked,
    evented: !locked,
    lockMovementX: locked,
    lockMovementY: locked,
    lockRotation: locked,
    lockScalingX: locked,
    lockScalingY: locked,
  });
  object.setControlsVisibility?.({
    mt: !locked,
    mb: !locked,
    ml: !locked,
    mr: !locked,
    tl: !locked,
    tr: !locked,
    bl: !locked,
    br: !locked,
    mtr: !locked,
  });
}
