# Paint Controls and Local Eraser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add adjustable brush width and opacity, replace whole-path deletion with selective local erasing, and simplify the bottom shape shortcuts to rectangle only.

**Architecture:** Keep Fabric free drawing for both brush and eraser pointer collection. Convert completed eraser paths into inverted clip masks attached only to intersected `editorType: "drawing"` objects; keep image and other object layers untouched. Store width and opacity in controller state and expose them through a compact paint settings popover.

**Tech Stack:** React 18, TypeScript, Fabric.js 7.4, Vitest, Testing Library, Vite, CSS.

---

## File Map

- Modify `src/components/image-editor/ImageEditor.types.ts`: add `drawOpacity` state.
- Modify `src/components/image-editor/toolbars/PaintToolbar.tsx`: add settings popover, width and opacity controls.
- Modify `src/components/image-editor/toolbars/BottomToolbar.tsx`: remove ellipse and line shortcuts.
- Modify `src/components/image-editor/ImageEditor.css`: style the compact settings popover and range controls.
- Modify `src/components/image-editor/core/PaintTools.ts`: add color/opacity conversion and selective eraser-mask application.
- Modify `src/components/image-editor/hooks/useImageEditorController.ts`: configure brush/eraser drawing and commit masks.
- Modify tests beside the affected modules.
- Modify `README.md`, `registry.json`, and `design-qa.md`: document and verify the shipped behavior.

### Task 1: Paint settings and toolbar simplification

**Files:**
- Modify: `src/components/image-editor/ImageEditor.test.tsx`
- Modify: `src/components/image-editor/ImageEditor.types.ts`
- Modify: `src/components/image-editor/toolbars/PaintToolbar.tsx`
- Modify: `src/components/image-editor/toolbars/BottomToolbar.tsx`
- Modify: `src/components/image-editor/ImageEditor.css`

- [ ] **Step 1: Write failing UI tests**

Add `drawOpacity`, `setDrawWidth`, and `setDrawOpacity` to the controller double. Assert that paint settings expose width and opacity sliders and dispatch numeric values. Assert rectangle remains while ellipse and line are absent.

```tsx
expect(screen.getByRole("slider", { name: "画笔大小" })).toHaveValue("6");
expect(screen.getByRole("slider", { name: "画笔不透明度" })).toHaveValue("100");
expect(screen.getByRole("button", { name: "矩形" })).toBeInTheDocument();
expect(screen.queryByRole("button", { name: "椭圆" })).not.toBeInTheDocument();
expect(screen.queryByRole("button", { name: "直线" })).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- --run src/components/image-editor/ImageEditor.test.tsx
```

Expected: FAIL because the sliders/actions do not exist and ellipse/line are still rendered.

- [ ] **Step 3: Implement state and controls**

Add `drawOpacity: number` to `ImageEditorState`. In `PaintToolbar`, keep brush/eraser/color controls and add a settings panel containing:

```tsx
<input
  type="range"
  aria-label="画笔大小"
  min={1}
  max={40}
  value={state.drawWidth}
  onChange={(event) => actions.setDrawWidth(Number(event.target.value))}
/>
<input
  type="range"
  aria-label="画笔不透明度"
  min={10}
  max={100}
  value={Math.round(state.drawOpacity * 100)}
  onChange={(event) => actions.setDrawOpacity(Number(event.target.value) / 100)}
/>
```

Remove only the ellipse and line `ToolButton` elements and unused icons from `BottomToolbar`. Add CSS for a 280 px dark popover, label/value rows, and full-width range inputs.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
npm test -- --run src/components/image-editor/ImageEditor.test.tsx
```

Expected: PASS.

### Task 2: Selective vector eraser core

**Files:**
- Modify: `src/components/image-editor/core/PaintTools.test.ts`
- Modify: `src/components/image-editor/core/PaintTools.ts`

- [ ] **Step 1: Replace deletion tests with failing mask tests**

Test a wished-for API:

```ts
expect(colorWithOpacity("#ff2d20", 0.5)).toBe("rgba(255,45,32,0.5)");

const changed = await applyEraserStroke(canvas, eraserPath);
expect(changed).toBe(true);
expect(drawing.clipPath).toMatchObject({ inverted: true });
expect(canvas.remove).toHaveBeenCalledWith(eraserPath);
expect(canvas.remove).not.toHaveBeenCalledWith(drawing);
expect(image.clipPath).toBeUndefined();
```

Also test no intersection returns `false` and leaves all objects unchanged.

- [ ] **Step 2: Run the core test and verify RED**

Run:

```bash
npm test -- --run src/components/image-editor/core/PaintTools.test.ts
```

Expected: FAIL because `colorWithOpacity` and `applyEraserStroke` do not exist.

- [ ] **Step 3: Implement mask application**

Implement:

```ts
export function colorWithOpacity(hex: string, opacity: number): string;
export async function applyEraserStroke(canvas: Canvas, eraserPath: Path): Promise<boolean>;
```

`applyEraserStroke` must remove the temporary eraser path, filter to intersected root drawing objects, clone the eraser path, convert each clone from canvas coordinates into the target transform plane with `util.sendObjectToPlane`, set it to `inverted`, and merge it with an existing clip path using `util.mergeClipPaths`. Mark the target dirty and rerender only when at least one target changed.

- [ ] **Step 4: Run core tests and verify GREEN**

Run:

```bash
npm test -- --run src/components/image-editor/core/PaintTools.test.ts
```

Expected: PASS with drawing object preserved and non-drawing object untouched.

### Task 3: Controller integration

**Files:**
- Modify: `src/components/image-editor/hooks/useImageEditorController.ts`
- Modify: `src/components/image-editor/hooks/useImageEditorController.test.tsx`

- [ ] **Step 1: Write failing controller tests**

Assert default state includes `drawOpacity: 1`, width and opacity actions clamp inputs, eraser mode keeps Fabric free drawing enabled, and completed eraser paths call the mask helper rather than object deletion.

```ts
act(() => result.current.actions.setDrawWidth(99));
act(() => result.current.actions.setDrawOpacity(0));
expect(result.current.state.drawWidth).toBe(40);
expect(result.current.state.drawOpacity).toBe(0.1);
```

- [ ] **Step 2: Run controller tests and verify RED**

Run:

```bash
npm test -- --run src/components/image-editor/hooks/useImageEditorController.test.tsx
```

Expected: FAIL because opacity/actions and eraser free drawing are missing.

- [ ] **Step 3: Implement brush configuration and eraser commit flow**

Create one internal `configurePaintBrush(mode)` function. Brush mode uses `colorWithOpacity(drawColor, drawOpacity)`. Eraser mode uses a visible neutral preview color and the current width. Both set `canvas.isDrawingMode = true`.

In `path:created`:

```ts
if (stateRef.current.paintMode === "eraser") {
  void applyEraserStroke(canvas, event.path).then((changed) => {
    if (changed) commitCanvas();
  }).catch(reportError);
  return;
}
ensureEditorMetadata(event.path, "drawing", "画笔");
commitCanvas();
```

Delete the old `mouse:down`/`mouse:move` whole-object eraser handlers and `eraserChangedRef`. Implement clamped `setDrawWidth` and `setDrawOpacity` actions that immediately reconfigure the active brush.

- [ ] **Step 4: Run controller and full unit tests**

Run:

```bash
npm test -- --run src/components/image-editor/hooks/useImageEditorController.test.tsx
npm test -- --run
npm run typecheck
```

Expected: all tests pass and TypeScript reports no errors.

### Task 4: Browser QA, documentation, and release verification

**Files:**
- Modify: `README.md`
- Modify: `design-qa.md`
- Create: `design-qa-paint-settings-eraser.png`
- Create: `design-qa-paint-settings-comparison.png`

- [ ] **Step 1: Verify interactions in the in-app browser**

At `http://127.0.0.1:5173/?demo=editor`:

1. Open paint mode.
2. Set width to a visibly thick value and opacity near 50%.
3. Draw a stroke over an image.
4. Switch to eraser and cross only the middle of the stroke.
5. Verify both outer stroke segments remain and the image is intact.
6. Verify rectangle exists while ellipse and line do not.
7. Inspect browser errors and warnings.

- [ ] **Step 2: Run design QA**

Capture the settings state, combine it beside the supplied reference image, inspect both in one comparison image, and update `design-qa.md`. Fix all P0/P1/P2 findings before marking `final result: passed`.

- [ ] **Step 3: Update documentation**

Document adjustable width/opacity, annotation-only local erasing, and the simplified primary shape toolbar in `README.md`.

- [ ] **Step 4: Run final verification**

Run:

```bash
npm test -- --run
npm run typecheck
npm run build:lib
npm run build:preview
npm pack --dry-run
git diff --check
```

Expected: zero test/type/build failures, package contents include the updated declarations, and no whitespace errors.

- [ ] **Step 5: Commit implementation**

```bash
git add README.md design-qa.md registry.json src/components/image-editor design-qa-paint-settings-eraser.png design-qa-paint-settings-comparison.png
git commit -m "feat: add adjustable paint controls and local erasing"
```
