# Image Editor MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a fully interactive, single-canvas React image editor based on Fabric.js, matching the approved dark editor reference and the MediaRig component-library conventions.

**Architecture:** Keep Fabric.js behind an `ImageEditor` React facade. A controller hook owns the Fabric canvas and routes user actions through focused command, history, serialization, crop, and export modules; React toolbars and panels consume serializable editor state rather than Fabric objects. Document changes are snapshotted only at transaction boundaries, while viewport and selection state remain ephemeral.

**Tech Stack:** React 18, TypeScript 6, Fabric.js, Lucide React, CSS, Vite 5, Vitest, jsdom, Testing Library.

---

## Execution prerequisites

- Execute in an isolated `codex/image-editor-mvp` worktree created from commit `c87c7df`; the primary worktree contains unrelated, uncommitted `DirectorStage` changes.
- Preserve those unrelated changes and do not copy them into the implementation branch.
- Use Node and npm versions already accepted by the existing lockfile.
- Run all commands from the worktree root.

## File map

### New component files

- `src/components/image-editor/ImageEditor.tsx`: public component and imperative handle.
- `src/components/image-editor/ImageEditor.types.ts`: public document, state, error, export, and handle types.
- `src/components/image-editor/ImageEditor.constants.ts`: aspect ratios, limits, colors, and tool defaults.
- `src/components/image-editor/ImageEditor.css`: scoped editor layout and control styles.
- `src/components/image-editor/index.ts`: public exports.
- `src/components/image-editor/core/DocumentSerializer.ts`: version validation and Fabric/document conversion.
- `src/components/image-editor/core/HistoryManager.ts`: bounded snapshot history.
- `src/components/image-editor/core/EditorCommands.ts`: object creation, transform, layer, lock, visibility, duplication, and alignment commands.
- `src/components/image-editor/core/ImageService.ts`: file validation, Data URL conversion, URL loading, replacement, fit, fill, and flips.
- `src/components/image-editor/core/CropSession.ts`: reversible crop transaction.
- `src/components/image-editor/core/ExportService.ts`: PNG/JPEG Blob export.
- `src/components/image-editor/core/SnapGuides.ts`: center/edge snapping and guide rendering.
- `src/components/image-editor/hooks/useFabricCanvas.ts`: Fabric lifecycle and viewport sizing.
- `src/components/image-editor/hooks/useImageEditorController.ts`: state, event, history, persistence, and command orchestration.
- `src/components/image-editor/hooks/useEditorKeyboard.ts`: scoped shortcuts and clipboard behavior.
- `src/components/image-editor/toolbars/TopToolbar.tsx`: canvas and document actions.
- `src/components/image-editor/toolbars/BottomToolbar.tsx`: creation and viewport actions.
- `src/components/image-editor/toolbars/SelectionToolbar.tsx`: contextual object actions.
- `src/components/image-editor/panels/LayersPanel.tsx`: layer list, visibility, lock, selection, and order.
- `src/components/image-editor/controls/ColorControl.tsx`: accessible color input wrapper.
- `src/components/image-editor/controls/NumberControl.tsx`: bounded numeric input.
- `src/components/image-editor/utils/editorObject.ts`: stable metadata and selection helpers.
- `src/components/image-editor/utils/geometry.ts`: fit, fill, center, and viewport calculations.

### New tests and preview files

- `src/components/image-editor/**/*.test.ts(x)`: unit and component tests colocated with implementation.
- `src/test/setup.ts`: Testing Library cleanup and browser API shims.
- `vitest.config.ts`: jsdom test configuration.
- `src/preview/pages/ImageEditorPreview.tsx`: full-size manual QA route.

### Existing files to modify

- `package.json`, `package-lock.json`: Fabric.js and test dependencies/scripts.
- `src/components/index.ts`: export `image-editor`.
- `src/preview/main.tsx`: expose `?demo=editor`.
- `src/preview/styles.css`: ensure Fabric upper/lower canvases are not globally forced to `height: 100%`.
- `vite.lib.config.ts`: keep Fabric bundled as an internal runtime dependency.
- `registry.json`: add an `image-editor` registry item and Fabric dependency.
- `README.md`, `README.en.md`: installation, API, and preview usage.

## Specification coverage

- Design sections 4 and 10 (architecture and file boundaries): Tasks 1–8.
- Design section 5 (layout and responsive behavior): Tasks 8–9.
- Design section 6.1 (canvas, ratios, custom size, background, zoom, pan, fit, fullscreen, DPR): Tasks 4, 7, and 8.
- Design section 6.2 (file picker, drag/drop, paste, URL images, formats, size limit, Data URLs): Tasks 6–8.
- Design sections 6.3–6.5 (selection, multi-selection, layers, snapping, text, shapes, arrows, free drawing): Tasks 5, 7, and 8.
- Design section 6.6 (replace, crop, contain, cover, flip, opacity): Tasks 6 and 8.
- Design sections 6.7–6.8 (bounded history, transaction merging, keyboard and clipboard): Tasks 3 and 7.
- Design section 6.9 (versioned save/load, PNG/JPEG Blob export, CORS): Tasks 2, 6, 7, and 10.
- Design sections 7–9 (data model, data flow, and public API): Tasks 1, 2, 7, 8, and 10.
- Design sections 11–12 (error handling and accessibility): Tasks 6–8.
- Design sections 13–14 (testing and completion criteria): every task, with final acceptance in Task 11.

## Task 1: Add Fabric.js and the test harness

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/components/image-editor/ImageEditor.test.tsx`
- Create: `src/components/image-editor/ImageEditor.tsx`
- Create: `src/components/image-editor/ImageEditor.types.ts`
- Create: `src/components/image-editor/ImageEditor.constants.ts`
- Create: `src/components/image-editor/index.ts`
- Modify: `src/components/index.ts`

- [ ] **Step 1: Install runtime and test dependencies**

Run:

```bash
npm install fabric
npm install -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Expected: `package.json` lists `fabric` under `dependencies`, test packages under `devDependencies`, and `package-lock.json` changes.

- [ ] **Step 2: Add exact test scripts and Vitest configuration**

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(cleanup);

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  },
});

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  writable: true,
  value: vi.fn(() => ({
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
    putImageData: vi.fn(),
    setTransform: vi.fn(),
    transform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
  })),
});
```

- [ ] **Step 3: Write a failing public-component smoke test**

Create `src/components/image-editor/ImageEditor.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ImageEditor from "./ImageEditor";

describe("ImageEditor", () => {
  it("renders a named editor region", () => {
    render(<ImageEditor />);
    expect(screen.getByRole("application", { name: "图片编辑器" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run the smoke test and verify the missing component failure**

Run:

```bash
npm test -- src/components/image-editor/ImageEditor.test.tsx
```

Expected: FAIL because `ImageEditor.tsx` does not exist.

- [ ] **Step 5: Add the public types, constants, minimal shell, and exports**

Define in `ImageEditor.types.ts` the approved `ImageEditorDocument`, `EditorObject`, `ImageEditorState`, `ImageEditorTool`, `ImageEditorError`, `ExportOptions`, `ImageEditorProps`, and `ImageEditorHandle` types. Use `version: 1`, default canvas `1024 × 1024`, `historyLimit: 50`, and `maxImageSize: 15 * 1024 * 1024` in `ImageEditor.constants.ts`.

Create the initial component:

```tsx
import React, { forwardRef } from "react";
import type { ImageEditorHandle, ImageEditorProps } from "./ImageEditor.types";

const ImageEditor = forwardRef<ImageEditorHandle, ImageEditorProps>(function ImageEditor(
  { className, style },
  _ref,
) {
  return (
    <section
      className={["image-editor", className].filter(Boolean).join(" ")}
      style={style}
      role="application"
      aria-label="图片编辑器"
    />
  );
});

export default ImageEditor;
```

Export the component and every public type from `src/components/image-editor/index.ts`, then append:

```ts
export * from "./image-editor";
```

to `src/components/index.ts`.

- [ ] **Step 6: Run the test and typecheck**

Run:

```bash
npm test -- src/components/image-editor/ImageEditor.test.tsx
npm run typecheck
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit the harness and public skeleton**

```bash
git add package.json package-lock.json vitest.config.ts src/test src/components/image-editor src/components/index.ts
git commit -m "feat: scaffold image editor component"
```

## Task 2: Implement document validation and serialization

**Files:**
- Create: `src/components/image-editor/core/DocumentSerializer.test.ts`
- Create: `src/components/image-editor/core/DocumentSerializer.ts`
- Create: `src/components/image-editor/utils/editorObject.ts`
- Modify: `src/components/image-editor/ImageEditor.types.ts`

- [ ] **Step 1: Write failing serializer tests**

Cover these exact cases:

```ts
it("rejects an unsupported document version", () => {
  expect(() => validateDocument({ version: 2 })).toThrowError("不支持的文档版本");
});

it("serializes stable editor metadata", () => {
  const object = fakeFabricObject({ id: "shape-1", editorType: "rect", name: "矩形 1" });
  const document = serializeCanvas(fakeCanvas([object]), {
    width: 1200,
    height: 800,
    background: "#ffffff",
  });
  expect(document.objects[0]).toMatchObject({
    id: "shape-1",
    type: "rect",
    name: "矩形 1",
    locked: false,
    visible: true,
  });
});

it("loads only after the complete document validates", async () => {
  const canvas = fakeLoadCanvas();
  await loadDocumentIntoCanvas(canvas, validDocument());
  expect(canvas.loadFromJSON).toHaveBeenCalledOnce();
  expect(canvas.setDimensions).toHaveBeenCalledWith({ width: 1200, height: 800 });
});
```

- [ ] **Step 2: Run the tests and verify missing exports fail**

Run:

```bash
npm test -- src/components/image-editor/core/DocumentSerializer.test.ts
```

Expected: FAIL because the serializer module is missing.

- [ ] **Step 3: Implement stable metadata helpers**

Create `utils/editorObject.ts` with:

```ts
import type { FabricObject } from "fabric";
import type { EditorObjectType } from "../ImageEditor.types";

export type EditableFabricObject = FabricObject & {
  id: string;
  editorType: EditorObjectType;
  name: string;
};

export function ensureEditorMetadata(
  object: FabricObject,
  type: EditorObjectType,
  name: string,
  id = crypto.randomUUID(),
): EditableFabricObject {
  return Object.assign(object, { id, editorType: type, name });
}

export const SERIALIZED_EDITOR_PROPERTIES = ["id", "editorType", "name"] as const;
```

- [ ] **Step 4: Implement validation, serialization, and loading**

`validateDocument` must check: object input, exact version `1`, finite positive canvas dimensions, nullable string background, unique non-empty object IDs, supported editor types, object names, booleans, and object-shaped `fabricData`.

`serializeCanvas` must call each Fabric object's `toObject([...SERIALIZED_EDITOR_PROPERTIES])`, separate editor metadata from `fabricData`, and preserve canvas stacking order.

`loadDocumentIntoCanvas` must validate before mutation, call `canvas.setDimensions`, assign `backgroundColor`, call `canvas.loadFromJSON` with metadata merged into every Fabric payload, and call `requestRenderAll` only after the returned promise resolves.

- [ ] **Step 5: Run serializer tests and the full test suite**

```bash
npm test -- src/components/image-editor/core/DocumentSerializer.test.ts
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit serialization**

```bash
git add src/components/image-editor
git commit -m "feat: add image editor document serialization"
```

## Task 3: Implement bounded snapshot history

**Files:**
- Create: `src/components/image-editor/core/HistoryManager.test.ts`
- Create: `src/components/image-editor/core/HistoryManager.ts`

- [ ] **Step 1: Write failing history tests**

```ts
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
```

- [ ] **Step 2: Verify the tests fail**

```bash
npm test -- src/components/image-editor/core/HistoryManager.test.ts
```

Expected: FAIL because `HistoryManager` is missing.

- [ ] **Step 3: Implement immutable history**

Implement `HistoryManager<T>` with `reset`, `commit`, `undo`, `redo`, `current`, `canUndo`, and `canRedo`. Clone every value with `structuredClone`; ignore a commit when its `JSON.stringify` value equals the current snapshot; enforce a minimum limit of 1.

- [ ] **Step 4: Verify history behavior**

```bash
npm test -- src/components/image-editor/core/HistoryManager.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit history**

```bash
git add src/components/image-editor/core
git commit -m "feat: add image editor history manager"
```

## Task 4: Create Fabric lifecycle and viewport utilities

**Files:**
- Create: `src/components/image-editor/utils/geometry.test.ts`
- Create: `src/components/image-editor/utils/geometry.ts`
- Create: `src/components/image-editor/hooks/useFabricCanvas.test.tsx`
- Create: `src/components/image-editor/hooks/useFabricCanvas.ts`

- [ ] **Step 1: Write failing geometry tests**

Test that `fitViewport({ width: 1000, height: 700 }, { width: 800, height: 800 }, 48)` returns a zoom that leaves 48 px of clearance, that zoom clamps to `0.1…8`, and that fill/contain calculations preserve aspect ratio.

- [ ] **Step 2: Implement geometry helpers**

Export pure `clampZoom`, `fitViewport`, `containSize`, and `coverSize` functions. Use:

```ts
export function fitViewport(viewport: Size, canvas: Size, padding = 48) {
  const availableWidth = Math.max(1, viewport.width - padding * 2);
  const availableHeight = Math.max(1, viewport.height - padding * 2);
  return clampZoom(Math.min(availableWidth / canvas.width, availableHeight / canvas.height));
}
```

- [ ] **Step 3: Write a failing lifecycle test**

Mock the `fabric` module and assert that mounting creates one `Canvas` with selection enabled, resizing calls `setDimensions` only for logical document size changes, and unmounting calls async `dispose()` exactly once.

- [ ] **Step 4: Implement `useFabricCanvas`**

The hook must:

- instantiate `new Canvas(canvasElement, { preserveObjectStacking: true, selection: true })` once;
- enable retina scaling and use Fabric's device-pixel-ratio handling;
- set `FabricObject.ownDefaults.transparentCorners = false` without mutating defaults repeatedly;
- observe the viewport with `ResizeObserver` and calculate fit zoom;
- expose `canvas`, `zoom`, `setZoom`, `fitToViewport`, and `viewportRef`;
- use `canvas.setViewportTransform([zoom, 0, 0, zoom, offsetX, offsetY])` to center the document;
- handle `mouse:wheel` zoom around the pointer and clamp zoom to `0.1…8`;
- pan with the middle mouse button or Space + primary drag without moving selected objects;
- call `canvas.dispose()` on cleanup and ignore its completion after unmount.

- [ ] **Step 5: Run focused and full tests**

```bash
npm test -- src/components/image-editor/utils/geometry.test.ts src/components/image-editor/hooks/useFabricCanvas.test.tsx
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit lifecycle and geometry**

```bash
git add src/components/image-editor
git commit -m "feat: add image editor canvas lifecycle"
```

## Task 5: Implement object commands and selection helpers

**Files:**
- Create: `src/components/image-editor/core/EditorCommands.test.ts`
- Create: `src/components/image-editor/core/EditorCommands.ts`
- Create: `src/components/image-editor/core/SnapGuides.test.ts`
- Create: `src/components/image-editor/core/SnapGuides.ts`
- Modify: `src/components/image-editor/utils/editorObject.ts`

- [ ] **Step 1: Write failing command tests**

Create a Canvas test double and cover:

- `addText` creates a centered `Textbox` with stable metadata.
- `addRect`, `addEllipse`, `addLine`, and `addArrow` add the expected editor type.
- `duplicateSelection` awaits Fabric's Promise-based `clone()`, offsets clones by 20 px, and assigns new IDs.
- delete, lock, visibility, bring forward, send backward, bring front, send back, horizontal center, vertical center, and full center affect every object in an active multi-selection.
- locked objects remain listed but set `selectable`, `evented`, and control visibility to false.

- [ ] **Step 2: Verify command tests fail**

```bash
npm test -- src/components/image-editor/core/EditorCommands.test.ts
```

Expected: FAIL because `EditorCommands` is missing.

- [ ] **Step 3: Implement creation commands**

Use Fabric's current named exports:

```ts
import { Ellipse, Group, Line, Rect, Textbox, Triangle, type Canvas } from "fabric";
```

Defaults:

- text: `"双击编辑文本"`, 48 px, Geist/sans-serif, white on dark previews;
- rectangle/ellipse: `240 × 160`, `#4b9eff` fill, transparent stroke;
- line/arrow: 4 px `#ffffff` stroke;
- every object centered with `canvas.centerObject`, activated, and rendered.

Build an arrow as a `Group` containing a `Line` and `Triangle`; mark only the group as `editorType: "arrow"`.

- [ ] **Step 4: Implement mutation commands**

Create a `getSelectedObjects(canvas)` helper that returns `canvas.getActiveObjects()`. Every mutation command must no-op safely when the selection is empty, call `setCoords()` on changed objects, preserve object order, call `requestRenderAll()`, and return a boolean or Promise<boolean> indicating whether the document changed.

- [ ] **Step 5: Run command tests and typecheck**

Before running, add `SnapGuides` tests for canvas-center, object-edge, and object-center snapping; snap threshold must be six screen pixels divided by the current zoom. Verify holding the controller's snap-disable modifier returns the original coordinates and no guide lines. Implement `SnapGuides` using `object:moving`, `before:render`, and `after:render`, and dispose all three listeners on teardown.

```bash
npm test -- src/components/image-editor/core/EditorCommands.test.ts src/components/image-editor/core/SnapGuides.test.ts
npm run typecheck
```

Expected: both commands exit 0.

- [ ] **Step 6: Commit object commands**

```bash
git add src/components/image-editor
git commit -m "feat: add image editor object commands"
```

## Task 6: Add image import, crop, and export services

**Files:**
- Create: `src/components/image-editor/core/ImageService.test.ts`
- Create: `src/components/image-editor/core/ImageService.ts`
- Create: `src/components/image-editor/core/CropSession.test.ts`
- Create: `src/components/image-editor/core/CropSession.ts`
- Create: `src/components/image-editor/core/ExportService.test.ts`
- Create: `src/components/image-editor/core/ExportService.ts`

- [ ] **Step 1: Write failing image-service tests**

Cover PNG/JPEG/WebP/GIF acceptance, type rejection, 15 MB default limit, FileReader failure, Data URL loading through `FabricImage.fromURL`, fit-to-80%-of-canvas placement, replacement preserving the object's displayed bounds, contain, cover, horizontal flip, and vertical flip.

- [ ] **Step 2: Implement `ImageService`**

Use a typed `ImageEditorError` with codes `UNSUPPORTED_FILE`, `FILE_TOO_LARGE`, `IMAGE_DECODE_FAILED`, and `IMAGE_CORS_FAILED`. Local files must be validated before `FileReader.readAsDataURL`. URL loads must pass `{ crossOrigin: "anonymous" }` to Fabric's image-loading API. Store the final Data URL or remote URL in serialized image data.

- [ ] **Step 3: Write failing crop-session tests**

Test these state transitions:

```ts
const session = CropSession.start(image);
session.pan(30, -10);
session.zoom(1.2);
session.cancel();
expect(image.toObject()).toMatchObject(beforeCrop);
```

and:

```ts
const session = CropSession.start(image);
session.pan(30, -10);
expect(session.confirm()).toEqual({ changed: true });
```

- [ ] **Step 4: Implement reversible crop state**

Capture `cropX`, `cropY`, width, height, scale, position, and source dimensions at start. Clamp crop offsets so the rendered crop never exposes transparent source pixels. `cancel` restores the exact captured properties; `confirm` removes temporary crop controls and returns whether serialized image data changed.

- [ ] **Step 5: Write failing export tests**

Mock `canvas.toDataURL`, `fetch`, and Blob conversion. Assert that viewport transforms and selection visuals are temporarily neutralized, PNG uses transparent background when requested, JPEG applies a white fallback background, multiplier is derived from requested output size, and original state is restored even when export throws.

- [ ] **Step 6: Implement `ExportService`**

Implement:

```ts
export async function exportCanvas(
  canvas: Canvas,
  document: ImageEditorDocument,
  options: ExportOptions,
): Promise<Blob>
```

Use canvas-level `toDataURL({ format, quality, multiplier })`, convert the result with `fetch(dataUrl).then(response => response.blob())`, and wrap security errors as `EXPORT_CORS_FAILED`.

- [ ] **Step 7: Run service tests**

```bash
npm test -- src/components/image-editor/core/ImageService.test.ts src/components/image-editor/core/CropSession.test.ts src/components/image-editor/core/ExportService.test.ts
```

Expected: all service tests pass.

- [ ] **Step 8: Commit image services**

```bash
git add src/components/image-editor/core
git commit -m "feat: add image import crop and export"
```

## Task 7: Build the editor controller, history integration, and shortcuts

**Files:**
- Create: `src/components/image-editor/hooks/useImageEditorController.test.tsx`
- Create: `src/components/image-editor/hooks/useImageEditorController.ts`
- Create: `src/components/image-editor/hooks/useEditorKeyboard.test.tsx`
- Create: `src/components/image-editor/hooks/useEditorKeyboard.ts`

- [ ] **Step 1: Write failing controller tests**

Test that the controller:

- creates an initial history snapshot after Fabric is ready;
- commits once on `object:modified`, `object:added`, `object:removed`, and `path:created` transactions;
- never commits on `object:moving`, selection changes, zoom, or panel state;
- suppresses events during document loading and undo/redo;
- emits serializable objects through `onChange` and public objects through `onSelectionChange`;
- writes local storage only when `storageKey` is a non-empty string;
- restores the previous valid document if stored JSON is invalid;
- marks free-drawing paths with stable metadata on `path:created`.

- [ ] **Step 2: Implement the controller state machine**

Return this stable interface:

```ts
type ImageEditorController = {
  viewportRef: React.RefObject<HTMLDivElement>;
  canvasElementRef: React.RefObject<HTMLCanvasElement>;
  state: ImageEditorState;
  document: ImageEditorDocument;
  selectedObjects: EditorObject[];
  actions: ImageEditorActions;
};
```

Use `isRestoringRef`, `isDisposedRef`, and `transactionDepthRef` guards. Use `object:modified` as the transform commit boundary. Debounce text-edit commits by 300 ms and flush on `editing:exited`. Keep UI state in React; derive documents only through `DocumentSerializer`.

The action surface must include new/clear document, canvas dimensions and ratio, background, active tool, add/replace image, add text/shapes/line/arrow, drawing-mode toggle, selection commands, crop start/confirm/cancel, zoom, fit, fullscreen, save, export, load, undo, and redo. Initialize a `PencilBrush` when drawing starts and apply the current stroke color, width, and opacity. Handle drag/drop and clipboard `File` images through the same validated image-import path.

- [ ] **Step 3: Write failing keyboard tests**

Dispatch real keyboard events and assert undo/redo, clone, copy, paste, delete, escape, and temporary snap disable. Repeat each shortcut with an `input`, `textarea`, `select`, and active Fabric IText editing state and assert no command runs.

- [ ] **Step 4: Implement scoped keyboard handling**

Attach one `keydown` and one `keyup` listener while the editor is mounted. Check `rootRef.current?.contains(document.activeElement)` or pointer ownership before acting so multiple editors do not all receive shortcuts. Store copied objects as serialized editor objects, not Fabric instances.

- [ ] **Step 5: Run controller tests and the full suite**

```bash
npm test -- src/components/image-editor/hooks/useImageEditorController.test.tsx src/components/image-editor/hooks/useEditorKeyboard.test.tsx
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit controller behavior**

```bash
git add src/components/image-editor/hooks
git commit -m "feat: orchestrate image editor state and shortcuts"
```

## Task 8: Build the complete React interface

**Files:**
- Modify: `src/components/image-editor/ImageEditor.tsx`
- Create: `src/components/image-editor/toolbars/TopToolbar.tsx`
- Create: `src/components/image-editor/toolbars/BottomToolbar.tsx`
- Create: `src/components/image-editor/toolbars/SelectionToolbar.tsx`
- Create: `src/components/image-editor/panels/LayersPanel.tsx`
- Create: `src/components/image-editor/controls/ColorControl.tsx`
- Create: `src/components/image-editor/controls/NumberControl.tsx`
- Modify: `src/components/image-editor/ImageEditor.test.tsx`

- [ ] **Step 1: Expand the component tests before implementation**

Assert the initial screen contains named top, side, bottom, and canvas toolbars; new/clear, ratio and background controls; upload input; all creation tools; undo/redo disabled states; zoom, fit/fullscreen; save/download/close; and no AI or page controls. Add user-event tests for ratio change, custom dimensions, background change, tool activation, drag/drop image, pasted image, layer-panel toggle, save callback, close callback, and contextual toolbar switching by selected object type.

- [ ] **Step 2: Verify the expanded tests fail**

```bash
npm test -- src/components/image-editor/ImageEditor.test.tsx
```

Expected: FAIL because the real interface is not implemented.

- [ ] **Step 3: Implement accessible controls**

Every icon button must use this behavior:

```tsx
<button
  type="button"
  className={active ? "is-active" : undefined}
  aria-label={label}
  aria-pressed={toggle ? active : undefined}
  title={label}
  disabled={disabled}
  onClick={onClick}
>
  <Icon aria-hidden="true" size={20} />
</button>
```

`ColorControl` pairs a native color input with a text value. `NumberControl` parses finite values, clamps on blur, and retains the last valid value when input is invalid.

- [ ] **Step 4: Implement toolbars and layers panel**

Wire all controls only to controller actions. The top toolbar owns new/clear, ratio, custom dimensions, background, save, export, and close. The bottom toolbar owns selection, shape menu, line, arrow, drawing, text, image, undo, redo, zoom, and fit. The contextual toolbar exposes only operations valid for the current selection: text font/size/style/alignment/spacing/color, shape fill/stroke/width/opacity, line/arrow stroke/width/opacity, image replace/crop/contain/cover/flip/opacity, and common layer/delete/lock/alignment commands. The layer panel renders reverse stacking order and supports selection, lock, visibility, and ordering.

- [ ] **Step 5: Complete `ImageEditor` and imperative API**

Use `forwardRef` and `useImperativeHandle` to expose the approved `ImageEditorHandle`. Render a real `<canvas ref={canvasElementRef} />` inside the viewport. Render a busy overlay for async operations and an `aria-live="polite"` region for status and error messages. Forward every caught typed error to `onError` exactly once.

- [ ] **Step 6: Run component and accessibility-oriented tests**

```bash
npm test -- src/components/image-editor/ImageEditor.test.tsx
npm test
npm run typecheck
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit the interface**

```bash
git add src/components/image-editor
git commit -m "feat: build image editor interface"
```

## Task 9: Match the approved dark visual design and add preview QA

**Files:**
- Create: `src/components/image-editor/ImageEditor.css`
- Create: `src/preview/pages/ImageEditorPreview.tsx`
- Modify: `src/components/image-editor/ImageEditor.tsx`
- Modify: `src/preview/main.tsx`
- Modify: `src/preview/styles.css`

- [ ] **Step 1: Add the preview route before styling**

Create:

```tsx
import React from "react";
import { ImageEditor } from "../../index";

export default function ImageEditorPreview() {
  return <ImageEditor storageKey="media-rig-image-editor-preview" />;
}
```

Update preview routing so `?demo=editor` renders this page, `?demo=light` renders LightSphere, and the existing default remains DirectorStage.

- [ ] **Step 2: Isolate global canvas rules**

Change preview CSS so `height: 100%; width: 100%` applies only to the Three.js preview canvases. Fabric creates lower and upper canvas elements whose intrinsic and CSS dimensions must remain under Fabric's control.

- [ ] **Step 3: Implement scoped editor CSS**

Use `image-editor__*` classes and CSS custom properties. Match the approved reference with:

- near-black `#0b0b0d` work area;
- `#27282d` toolbar surfaces and `#41434a` borders;
- 14–16 px radii, 44 px minimum targets, and Lucide icons;
- centered white/checkerboard canvas with subtle shadow;
- floating bottom toolbar and selection toolbar;
- left rail and expandable 260 px layers panel;
- visible `:focus-visible` ring and non-color active markers;
- horizontal toolbar scrolling below 960 px;
- no handcrafted SVG, emoji, or text-symbol icons.

- [ ] **Step 4: Start the preview and inspect the target route**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173/?demo=editor` with the approved in-app browser. Exercise upload, text, shape, drawing, selection, layer order, crop, undo/redo, ratio, save/reload, PNG, JPEG, fit, and fullscreen.

Expected: every visible control has working behavior; no layout overflow at 1440×900 and 960×640.

- [ ] **Step 5: Compare against the supplied references**

Capture the implementation at the same broad desktop state as the original screenshot. Inspect the reference and implementation together; fix visible differences in layout hierarchy, canvas centering, toolbar placement, spacing, control size, colors, border radius, and selected states. Repeat comparison after fixes.

- [ ] **Step 6: Commit the visual interface and preview**

```bash
git add src/components/image-editor src/preview
git commit -m "feat: style image editor preview"
```

## Task 10: Package, registry, and documentation integration

**Files:**
- Modify: `vite.lib.config.ts`
- Modify: `registry.json`
- Modify: `README.md`
- Modify: `README.en.md`
- Create: `src/components/image-editor/public-api.test.tsx`

- [ ] **Step 1: Write a failing public API test**

Import `ImageEditor` and all documented public types from `src/index.ts`; render the component and call the imperative `getDocument`, `addText`, `undo`, `redo`, and `exportImage` methods through a ref. Assert no Fabric class is required by the caller.

- [ ] **Step 2: Verify the public API test fails on any missing export**

```bash
npm test -- src/components/image-editor/public-api.test.tsx
```

Expected: FAIL if any documented export or ref method is missing.

- [ ] **Step 3: Complete package and registry integration**

Keep `fabric` out of `vite.lib.config.ts` externals so the npm component owns a consistent Fabric runtime. Add an `image-editor` item to `registry.json` with dependency `fabric` and every file under `src/components/image-editor`, mapped to `components/image-editor/...`.

- [ ] **Step 4: Document usage**

Add Chinese and English examples that show:

```tsx
import { ImageEditor, type ImageEditorHandle } from "media-rig";

export default function App() {
  const editorRef = useRef<ImageEditorHandle>(null);
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ImageEditor ref={editorRef} onSave={document => console.log(document)} />
    </div>
  );
}
```

Document the parent-size requirement, storage behavior, image limit, callbacks, ref methods, supported formats, and CORS export limitation.

- [ ] **Step 5: Run package-level checks**

```bash
npm test -- src/components/image-editor/public-api.test.tsx
npm run typecheck
npm run build:lib
npm pack --dry-run
```

Expected: all commands exit 0; the package contains declarations, compiled library files, README files, and no preview-only code.

- [ ] **Step 6: Commit package integration**

```bash
git add vite.lib.config.ts registry.json README.md README.en.md src/components/image-editor
git commit -m "docs: publish image editor component API"
```

## Task 11: Final regression and acceptance verification

**Files:**
- Modify only files required by failures found during this task.

- [ ] **Step 1: Run the complete automated verification**

```bash
npm test
npm run typecheck
npm run build:lib
npm run build:preview
npm pack --dry-run
```

Expected: every command exits 0 with zero failed tests and zero TypeScript errors.

- [ ] **Step 2: Run the acceptance matrix manually**

Verify each item and record the result in the final handoff:

1. Create and edit every supported object type.
2. Move, scale, rotate, clone, delete, lock, hide, align, and reorder single and multi-selections.
3. Crop, cancel crop, replace, flip, contain, and fill images.
4. Undo and redo every document-level operation without transform noise.
5. Save JSON, reload it, and compare canvas size, background, object appearance, IDs, and layer order.
6. Export exact-size PNG with transparency and JPEG with configured quality.
7. Confirm failed file, URL, JSON, storage, and export operations preserve the current document.
8. Mount and unmount repeatedly without duplicate shortcuts, Fabric canvases, or Object URLs.
9. Navigate every toolbar control by keyboard and verify visible focus.
10. Check 1440×900 and 960×640 visual layouts against the supplied screenshots.

- [ ] **Step 3: Inspect repository state and focused diff**

```bash
git status --short
git diff --check
git log --oneline --decorate -12
```

Expected: no whitespace errors; only intentional implementation files are changed; unrelated `DirectorStage` changes are absent from the implementation branch.

- [ ] **Step 4: Commit any final verified fixes**

If Step 1–3 required changes:

```bash
git add src/components/image-editor src/preview package.json package-lock.json vite.config.ts vitest.config.ts vite.lib.config.ts registry.json README.md README.en.md
git commit -m "fix: complete image editor acceptance checks"
```

If no files changed, do not create an empty commit.
