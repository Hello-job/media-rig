# Shadcn-Style Component Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wrap both local demos in a faithful shadcn-style live-preview and expandable-source card.

**Architecture:** A preview-only `ComponentPreview` owns source reveal and clipboard state while the existing DirectorStage and LightSphere pages remain responsible for their demos. `main.tsx` selects page metadata and supplies each page's real source through Vite raw imports. Shared preview CSS creates the documentation canvas, large 3D stage, three-line gradient treatment, expanded scroll region, and responsive layout.

**Tech Stack:** React 18, TypeScript, Vite raw imports, Tailwind CSS v4, Lucide React, Vitest, Testing Library, jsdom.

---

### Task 1: Add Preview Test Infrastructure

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/preview/test/setup.ts`

- [ ] **Step 1: Install the test dependencies**

Run: `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom`

Expected: dependency installation exits successfully and updates both package files.

- [ ] **Step 2: Add the test script**

Add to `package.json` scripts:

```json
"test": "vitest run"
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/preview/test/setup.ts"],
  },
});
```

Create `src/preview/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Verify the empty test command**

Run: `npm test -- --passWithNoTests`

Expected: exit 0 with no test failures.

### Task 2: Build the Shared Preview Card with TDD

**Files:**
- Create: `src/preview/components/ComponentPreview.test.tsx`
- Create: `src/preview/components/ComponentPreview.tsx`

- [ ] **Step 1: Write the failing interaction tests**

Create tests that render a labeled live preview and a six-line source string. Assert that the initial source contains only lines 1-3, that `View Code` reveals line 6 and a `Copy source` action, and that the copy action writes the full source and changes its accessible label to `Copied`.

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ComponentPreview from "./ComponentPreview";

const source = ["line 1", "line 2", "line 3", "line 4", "line 5", "line 6"].join("\n");

describe("ComponentPreview", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockReset();
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  });

  it("shows a three-line preview before revealing the full source", () => {
    render(<ComponentPreview title="Demo" description="Description" source={source}><div>Live demo</div></ComponentPreview>);
    expect(screen.getByText("line 3")).toBeInTheDocument();
    expect(screen.queryByText("line 4")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View Code" }));
    expect(screen.getByText("line 6")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy source" })).toBeInTheDocument();
  });

  it("copies the complete source", async () => {
    render(<ComponentPreview title="Demo" description="Description" source={source}><div>Live demo</div></ComponentPreview>);
    fireEvent.click(screen.getByRole("button", { name: "View Code" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy source" }));
    expect(writeText).toHaveBeenCalledWith(source);
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the tests to verify RED**

Run: `npm test -- src/preview/components/ComponentPreview.test.tsx`

Expected: FAIL because `./ComponentPreview` does not exist.

- [ ] **Step 3: Implement the minimal reusable preview**

Create `ComponentPreview.tsx` with typed `title`, `description`, `source`, `stageClassName`, and `children` props. Use `useState` for one-way source reveal and copied state. Render source lines as separate rows with line-number spans. Use `Copy` and `Check` from `lucide-react` for the expanded copy action and call `navigator.clipboard.writeText(source)`.

- [ ] **Step 4: Run the tests to verify GREEN**

Run: `npm test -- src/preview/components/ComponentPreview.test.tsx`

Expected: both tests pass.

### Task 3: Wire Both Demo Routes into the Preview Card

**Files:**
- Modify: `src/preview/main.tsx`
- Modify: `src/preview/pages/DirectorStagePreview.tsx`
- Modify: `src/preview/pages/LightSpherePreview.tsx`

- [ ] **Step 1: Make each page fill its preview stage**

Pass `style={{ height: "100%" }}` to `DirectorStage`. Change the LightSphere root from `h-screen w-screen` to `h-full w-full min-h-0` so it follows the card stage instead of the viewport.

- [ ] **Step 2: Add raw source imports and page metadata**

In `main.tsx`, import both page modules with `?raw`, select the title, description, source, stage class, and rendered demo from the existing `demo` query parameter, then wrap the selected demo in `ComponentPreview`.

```tsx
const preview = demo === "light"
  ? { title: "Light Sphere", description: "...", source: lightSphereSource, stageClassName: "component-preview__stage--light", component: <LightSpherePreview /> }
  : { title: "Director Stage", description: "...", source: directorStageSource, stageClassName: "component-preview__stage--director", component: <DirectorStagePreview /> };
```

- [ ] **Step 3: Run unit tests and type checking**

Run: `npm test && npm run typecheck`

Expected: all tests pass and TypeScript exits 0.

### Task 4: Match the Shadcn Visual Treatment

**Files:**
- Modify: `src/preview/styles.css`

- [ ] **Step 1: Add the documentation canvas and card styles**

Update the root to allow page scrolling on a white background. Add focused preview classes for a centered content column, title/description, rounded 14px border card, live-stage clipping, source divider, three-line source preview, bottom-up gradient, centered outline button, 288px expanded source maximum, copy button, line numbers, and keyboard focus rings.

- [ ] **Step 2: Add responsive stage rules**

Use a large DirectorStage height on desktop, a slightly smaller LightSphere height, reduced outer page padding below 760px, and stage heights that accommodate the existing component breakpoints without changing internal component APIs.

- [ ] **Step 3: Run the full static verification**

Run: `npm test && npm run typecheck && npm run build:preview && npm run build`

Expected: all commands exit 0.

### Task 5: Browser and Design QA

**Files:**
- Create: `design-qa.md`

- [ ] **Step 1: Start the preview server**

Run: `npm run dev`

Expected: Vite reports a local URL.

- [ ] **Step 2: Capture the initial and expanded desktop states**

At a 1600x1000 viewport, capture the DirectorStage route before and after `View Code`. Confirm the same-card structure, three-line gradient preview, expanded source scrolling, visible copy action, and intact live component.

- [ ] **Step 3: Capture the mobile state**

At a 390x844 viewport, capture the initial state and confirm full-width card behavior, readable header, centered `View Code`, and no horizontal page overflow.

- [ ] **Step 4: Compare against the reference and fix issues**

Open the supplied reference and local captures together. Record findings in `design-qa.md`, fix all P0-P2 issues, recapture, and end the report with `final result: passed` only when the comparison and interactions pass.

- [ ] **Step 5: Run final verification**

Run: `npm test && npm run typecheck && npm run build:preview && npm run build`

Expected: all tests pass and every command exits 0.
