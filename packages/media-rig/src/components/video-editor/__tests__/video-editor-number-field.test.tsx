// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { EditNumberField } from "../edit-number-field";
import { useVideoEditor } from "../use-video-editor";
import type { MediaClip, VideoEditDocument } from "../types";

const original: MediaClip = {
  id: "clip",
  kind: "video",
  start: 0,
  in: 0,
  out: 5,
  speed: 1,
  volume: 1,
  muted: false,
  fadeIn: 0,
  fadeOut: 0,
  source: {
    id: "source",
    kind: "video",
    url: "blob:video",
    label: "Video",
    duration: 5,
    width: 1920,
    height: 1080,
  },
};
let root: Root;
let container: HTMLDivElement;
let session: ReturnType<typeof useVideoEditor>;
let callbacks: Map<number, FrameRequestCallback>;
const changes = vi.fn();
function Harness({ disabled = false }: { disabled?: boolean }) {
  const [value, setValue] = useState<VideoEditDocument>({
    version: 1,
    clips: [original],
  });
  session = useVideoEditor({
    value,
    sources: [original.source],
    onChange: (next) => {
      changes(next);
      setValue(next);
    },
  });
  const clip = session.doc.clips[0] as MediaClip;
  return (
    <EditNumberField
      label="speed"
      value={clip.speed}
      min={0.25}
      max={4}
      step={0.25}
      unit="x"
      disabled={disabled}
      onChange={(speed) => session.updateClip({ ...clip, speed })}
    />
  );
}
const slider = () => container.querySelector<HTMLElement>('[role="slider"]')!;
const input = () => container.querySelector<HTMLInputElement>("input")!;
async function pointer(type: string, x: number) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    clientX: x,
  });
  Object.defineProperty(event, "pointerId", { value: 1 });
  await act(async () => {
    slider().dispatchEvent(event);
  });
}
async function press(key: string, target: HTMLElement = slider()) {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
  });
  await act(async () => {
    target.dispatchEvent(event);
  });
  return event;
}
async function type(value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input(), value);
    input().dispatchEvent(new Event("input", { bubbles: true }));
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
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 300,
    height: 40,
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 300,
    bottom: 40,
    toJSON() {},
  });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<Harness />));
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("keeps drag drafts local and creates one undoable edit on release", async () => {
  await pointer("pointerdown", 100);
  await pointer("pointermove", 150);
  await pointer("pointermove", 210);
  await frame();
  expect(changes).not.toHaveBeenCalled();
  expect(Number(input().value)).toBeGreaterThan(1);
  await pointer("pointerup", 220);
  expect(changes).toHaveBeenCalledTimes(1);
  expect((session.doc.clips[0] as MediaClip).speed).toBe(Number(input().value));
  await frame();
  expect(changes).toHaveBeenCalledTimes(1);
  await act(async () => session.undo());
  expect(input().value).toBe("1");
  expect(session.canUndo).toBe(false);
});
it.each(["pointercancel", "lostpointercapture"])(
  "cancels drafts on %s",
  async (event) => {
    await pointer("pointerdown", 100);
    await pointer("pointermove", 210);
    await frame();
    await pointer(event, 210);
    await frame();
    expect(changes).not.toHaveBeenCalled();
    expect(input().value).toBe("1");
  },
);
it("uses the actual quarter-speed step and supports keyboard endpoints", async () => {
  expect((await press("ArrowRight")).defaultPrevented).toBe(true);
  expect(input().value).toBe("1.25");
  await press("End");
  expect(input().value).toBe("4");
  await press("Home");
  expect(input().value).toBe("0.25");
});
it("preserves precise input and commits once on Enter, with range clamping", async () => {
  await act(async () => input().focus());
  await type("2.35");
  expect(changes).not.toHaveBeenCalled();
  await press("Enter", input());
  expect(input().value).toBe("2.35");
  expect(changes).toHaveBeenCalledTimes(1);
  await act(async () => input().focus());
  await type("9");
  await act(async () => input().blur());
  expect(input().value).toBe("4");
  expect(changes).toHaveBeenCalledTimes(2);
});
it("allows empty input, restores on blur, and cancels input with Escape", async () => {
  await act(async () => input().focus());
  await type("");
  await act(async () => input().blur());
  expect(input().value).toBe("1");
  expect(changes).not.toHaveBeenCalled();
  await type("2");
  expect((await press("Escape", input())).defaultPrevented).toBe(true);
  expect(input().value).toBe("1");
  expect(changes).not.toHaveBeenCalled();
});
it("disables input and pointer or keyboard changes", async () => {
  await act(async () => root.render(<Harness disabled />));
  await pointer("pointerdown", 100);
  await pointer("pointerup", 210);
  await press("ArrowRight");
  expect(input().disabled).toBe(true);
  expect(slider().getAttribute("tabindex")).toBe("-1");
  expect(changes).not.toHaveBeenCalled();
});
