# Paint Controls and Local Eraser Design

## Goal

Improve the Fabric.js image editor's annotation workflow without changing the document model or damaging image, text, and shape layers.

The approved scope is:

- Add adjustable brush width from 1 to 40 px.
- Add adjustable brush opacity from 10% to 100%.
- Replace whole-stroke deletion with local, drag-based erasing.
- Erase only freehand annotation strokes; never erase images, text, arrows, or shapes.
- Keep only the rectangle entry among the rectangle, ellipse, and line controls in the bottom toolbar.

## Interaction Design

The existing floating paint toolbar remains visible while paint mode is active. Brush and eraser stay as the first two controls. The color control opens a compact settings popover modeled on the supplied reference:

- `画笔大小`: range slider plus the current pixel value.
- `不透明度`: range slider plus the current percentage.
- `画笔颜色`: the existing native color input and visible swatch.

Changes take effect on the next stroke and update the currently configured brush immediately. Eraser width follows the same width setting so the visible control remains predictable. Erasing always removes annotation pixels at full strength; brush opacity does not weaken the eraser.

The bottom toolbar removes the ellipse and line buttons. The corresponding command implementations remain internal for document compatibility, but no longer appear as primary UI actions.

## Eraser Architecture

The current behavior deletes a complete Fabric path as soon as the pointer hits it. That object-level deletion is the root cause of the reported bug.

The replacement uses vector clip masks:

1. Eraser mode uses Fabric's free-drawing pointer collection to create an eraser path.
2. The temporary eraser path is removed from the canvas immediately after the stroke completes.
3. Only root objects with `editorType: "drawing"` are considered eraser targets.
4. For each intersected drawing, the eraser path is cloned and transformed from canvas coordinates into the drawing object's coordinate plane.
5. The transformed path becomes an inverted clip mask. Additional eraser strokes are merged with the existing mask so erased regions accumulate.
6. The affected drawing is marked dirty, the canvas rerenders, and the document is committed once per eraser gesture.

This preserves vector drawings, keeps the source image untouched, and allows the existing serializer, undo/redo history, save, and export paths to retain the erased result.

## State and Data Flow

`ImageEditorState` gains `drawOpacity`, while the existing `drawWidth` becomes user-adjustable. New controller actions are:

- `setDrawWidth(width)` clamps and stores a value from 1 to 40.
- `setDrawOpacity(opacity)` clamps and stores a value from 0.1 to 1.

Brush color is computed from the selected hex color and opacity before assigning it to `PencilBrush`. Switching between brush and eraser recreates the Fabric brush with the current width. The eraser path itself is not serialized as a top-level editor object; only the drawing clip masks are persisted.

## Compatibility and Failure Handling

- Existing documents without `drawOpacity` load with a default opacity of 1.
- Existing standalone drawing paths remain erasable.
- An eraser stroke that intersects no drawings produces no history entry.
- A click or very short eraser gesture produces no destructive action.
- Non-drawing objects are ignored even when visually intersected.
- Clip-mask application failures are reported through the existing `onError` path and do not delete the original drawing.

## Testing

Implementation follows test-driven development:

- UI test: the settings popover exposes width, opacity, and color controls and dispatches the correct actions.
- Toolbar test: ellipse and line buttons are absent while rectangle remains.
- Brush test: hex color and opacity produce the expected RGBA brush color; width updates both brush and eraser brushes.
- Eraser unit test: an eraser path creates or extends a clip mask on intersected drawing objects.
- Eraser safety test: image, text, arrow, rectangle, ellipse, and line objects remain unchanged.
- Eraser no-op test: no intersection creates no document commit.
- Regression test: erasing part of a stroke does not remove the whole drawing object.
- Browser QA: draw a partially transparent thick stroke, erase through only its middle, verify the underlying image remains visible and the un-erased stroke segments remain.
- Full regression: unit tests, typecheck, library build, preview build, registry validation, and browser console inspection.

## Acceptance Criteria

- Width and opacity controls are visible, keyboard-accessible, and functional.
- Brush output visibly reflects both settings.
- Dragging the eraser removes only the crossed portion of freehand annotations.
- The underlying image and all non-drawing objects remain unchanged.
- Undo restores the erased region and redo reapplies it.
- Rectangle is the only basic-shape shortcut shown in the bottom toolbar.
- QA contains no unresolved P0, P1, or P2 issue.
