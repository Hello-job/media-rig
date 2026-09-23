// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { EditExportMenu } from "../edit-export-menu";
import type { VideoEditorExportSettings } from "../types";

let root: Root;
let container: HTMLDivElement;
const onExport = vi.fn();
async function render(
  recommendedResolution?: VideoEditorExportSettings["resolution"],
) {
  await act(async () =>
    root.render(
      <EditExportMenu
        disabled={false}
        recommendedResolution={recommendedResolution}
        actions={[{ id: "local", label: "Local" }]}
        onExport={onExport}
      />,
    ),
  );
}
async function click(selector: string) {
  const element = document.querySelector<HTMLElement>(selector);
  expect(element).not.toBeNull();
  await act(async () => element!.click());
}
const resolutionField = () =>
  document.querySelector('[aria-label="Resolution"]');

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  onExport.mockClear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
  vi.unstubAllGlobals();
});

it.each([480, 720, 1080] as const)(
  "defaults to the suggested %iP and exports that resolution",
  async (value) => {
    await render(value);
    await click('[aria-label="Export"]');
    expect(resolutionField()?.textContent).toContain(`${value}P (recommended)`);
    const confirm = [...document.querySelectorAll("button")].find(
      (button) => button.textContent === "Confirm",
    )!;
    await act(async () => confirm.click());
    expect(onExport).toHaveBeenCalledWith("local", {
      resolution: value,
      format: "mp4",
    });
  },
);

it("keeps all resolutions available and preserves a manual choice across reopening and new recommendations", async () => {
  await render(480);
  await click('[aria-label="Export"]');
  await act(async () => {
    resolutionField()!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
  });
  expect(
    [...document.querySelectorAll('[role="option"]')].map(
      (option) => option.textContent,
    ),
  ).toEqual(["480P (recommended)", "720P", "1080P"]);
  const option = [
    ...document.querySelectorAll<HTMLElement>('[role="option"]'),
  ].find((option) => option.textContent === "1080P")!;
  await act(async () => option.click());
  expect(resolutionField()?.textContent).toBe("1080P");
  const cancel = [...document.querySelectorAll("button")].find(
    (button) => button.textContent === "Cancel",
  )!;
  await act(async () => cancel.click());
  await render(720);
  await click('[aria-label="Export"]');
  expect(resolutionField()?.textContent).toBe("1080P");
  const confirm = [...document.querySelectorAll("button")].find(
    (button) => button.textContent === "Confirm",
  )!;
  await act(async () => confirm.click());
  expect(onExport).toHaveBeenCalledWith("local", {
    resolution: 1080,
    format: "mp4",
  });
});
