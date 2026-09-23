// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PreviewSelection } from "../preview-selection";
import type { EditClip, MediaClip } from "../types";

const original: MediaClip = {
  id: "video",
  kind: "video",
  source: {
    id: "source",
    kind: "video",
    url: "blob:video",
    label: "Video",
    duration: 5,
    width: 1000,
    height: 500,
  },
  start: 0,
  in: 0,
  out: 5,
  speed: 1,
  volume: 1,
  muted: false,
  fadeIn: 0,
  fadeOut: 0,
};
let root: Root;
let container: HTMLDivElement;
let callbacks: Map<number, FrameRequestCallback>;
const draft = vi.fn();
const commit = vi.fn();
function Harness() {
  const [clip, setClip] = useState<EditClip>(original);
  return (
    <PreviewSelection
      clip={clip}
      width={1000}
      height={500}
      disabled={false}
      onStop={vi.fn()}
      onDraft={(value) => {
        draft(value);
        setClip(value ?? original);
      }}
      onCommit={commit}
    />
  );
}
async function pointer(type: string, x: number, y: number) {
  await act(async () => {
    container
      .querySelector('button[aria-label="Move selection"]')!
      .dispatchEvent(
        new MouseEvent(type, {
          bubbles: true,
          clientX: x,
          clientY: y,
          button: 0,
        }),
      );
  });
}
async function frame() {
  const pending = [...callbacks.values()];
  callbacks.clear();
  await act(async () => pending.forEach((callback) => callback(16)));
}
beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  callbacks = new Map();
  let sequence = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callbacks.set(++sequence, callback);
    return sequence;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => callbacks.delete(id));
  let captured = false;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  Object.defineProperties(HTMLElement.prototype, {
    setPointerCapture: {
      configurable: true,
      value: () => {
        captured = true;
      },
    },
    hasPointerCapture: { configurable: true, value: () => captured },
    releasePointerCapture: {
      configurable: true,
      value: () => {
        captured = false;
      },
    },
  });
  container = document.createElement("div");
  root = createRoot(container);
  await act(async () => root.render(<Harness />));
});
afterEach(async () => {
  await act(async () => root.unmount());
  for (const method of [
    "setPointerCapture",
    "hasPointerCapture",
    "releasePointerCapture",
  ])
    Reflect.deleteProperty(HTMLElement.prototype, method);
  vi.unstubAllGlobals();
});
it("coalesces drag updates and commits the exact pointer-up position without a late draft", async () => {
  await pointer("pointerdown", 100, 100);
  await pointer("pointermove", 110, 105);
  await pointer("pointermove", 150, 120);
  await pointer("pointermove", 180, 130);
  expect(draft).not.toHaveBeenCalled();
  await frame();
  expect(draft).toHaveBeenCalledTimes(1);
  expect(draft.mock.calls[0][0].transform).toEqual({
    x: 0.58,
    y: 0.56,
    scale: 1,
  });
  await pointer("pointermove", 190, 135);
  await pointer("pointerup", 200, 150);
  expect(commit).toHaveBeenCalledTimes(1);
  expect(commit.mock.calls[0][0].transform).toEqual({
    x: 0.6,
    y: 0.6,
    scale: 1,
  });
  expect(draft).toHaveBeenLastCalledWith(null);
  const count = draft.mock.calls.length;
  await frame();
  expect(draft).toHaveBeenCalledTimes(count);
});
it.each(["pointercancel", "lostpointercapture"])(
  "discards queued drafts on %s",
  async (event) => {
    await pointer("pointerdown", 100, 100);
    await pointer("pointermove", 180, 130);
    await pointer(event, 180, 130);
    await frame();
    expect(draft).toHaveBeenCalledExactlyOnceWith(null);
    expect(commit).not.toHaveBeenCalled();
  },
);
it("cancels a queued update on unmount", async () => {
  await pointer("pointerdown", 100, 100);
  await pointer("pointermove", 180, 130);
  await act(async () => root.unmount());
  root = createRoot(container);
  await frame();
  expect(draft).not.toHaveBeenCalled();
  expect(commit).not.toHaveBeenCalled();
});

it.each([undefined, "subtitle"] as const)(
  "keeps preview text draggable for textType=%s",
  async (textType) => {
    const context = vi
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(null);
    const clip: EditClip = {
      id: "text",
      kind: "text",
      textType,
      text: "Text",
      start: 0,
      duration: 3,
      fontSize: 48,
      color: "#ffffff",
      x: 0.5,
      y: 0.9,
    };
    try {
      await act(async () =>
        root.render(
          <PreviewSelection
            clip={clip}
            width={1000}
            height={500}
            disabled={false}
            onStop={vi.fn()}
            onDraft={draft}
            onCommit={commit}
          />,
        ),
      );
      await pointer("pointerdown", 100, 100);
      await pointer("pointermove", 200, 50);
      await frame();
      await pointer("pointerup", 200, 50);
      expect(commit).toHaveBeenCalledExactlyOnceWith({
        ...clip,
        x: 0.6,
        y: 0.8,
      });
    } finally {
      context.mockRestore();
    }
  },
);
