// @vitest-environment jsdom
import { act, StrictMode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVideoEditor } from "../use-video-editor";
import { EMPTY_EDIT } from "../timeline";
import type {
  VideoEditDocument,
  VideoEditorOptions,
  VideoEditorSource,
} from "../types";

const sources: VideoEditorSource[] = [
  {
    id: "local-video",
    kind: "video",
    url: "blob:standalone-video",
    label: "Video",
  },
  {
    id: "local-music",
    kind: "audio",
    url: "blob:standalone-music",
    label: "Music",
  },
];
const services = {
  loadSource: vi.fn(async (source: VideoEditorSource) => ({
    ...source,
    duration: 5,
    width: 1920,
    height: 1080,
  })),
};
let root: Root;
let session: ReturnType<typeof useVideoEditor>;
let props: Partial<VideoEditorOptions>;
let replace: (doc: VideoEditDocument) => void;
const changes = vi.fn();
function Harness() {
  const [value, setValue] = useState(EMPTY_EDIT);
  replace = setValue;
  session = useVideoEditor({
    sources,
    services,
    value,
    onChange: (next) => {
      changes(next);
      setValue(next);
    },
    ...props,
  });
  return null;
}
async function render(next: Partial<VideoEditorOptions> = {}) {
  props = next;
  await act(async () =>
    root.render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    ),
  );
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  root = createRoot(document.createElement("div"));
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.unstubAllGlobals();
});
describe("controlled video editor without host providers", () => {
  it("accepts local media, emits controlled edits and restores history", async () => {
    await render();
    expect(services.loadSource).not.toHaveBeenCalled();
    await act(async () => session.addSource("local-video"));
    await act(async () => session.addSource("local-music"));
    expect(session.doc.clips.map((clip) => clip.kind)).toEqual([
      "video",
      "audio",
    ]);
    expect(changes).toHaveBeenCalledTimes(2);
    expect(session.missing).toBe(false);
    await act(async () => session.undo());
    expect(session.doc.clips).toHaveLength(1);
    await act(async () => session.redo());
    expect(session.doc.clips).toHaveLength(2);
    const external: VideoEditDocument = { version: 1, clips: [] };
    await act(async () => replace(external));
    await act(async () => session.undo());
    expect(session.doc).toBe(external);
  });
  it("auto imports each source once under StrictMode and keeps manual deletions", async () => {
    await render({ autoImport: true });
    expect(session.doc.clips).toHaveLength(2);
    expect(services.loadSource).toHaveBeenCalledTimes(2);
    await act(async () => session.commit({ ...session.doc, clips: [] }));
    expect(session.doc.clips).toHaveLength(0);
    expect(services.loadSource).toHaveBeenCalledTimes(2);
  });
  it("supplies export adapters with the document, destination, progress and cancellation", async () => {
    const onExport = vi.fn(
      async ({ document, destination, signal, onProgress, settings }) => {
        expect(settings).toEqual({ resolution: 720, format: "mov" });
        expect(document.clips).toHaveLength(1);
        expect(destination).toBe("custom-storage");
        expect(signal.aborted).toBe(false);
        onProgress(45);
      },
    );
    await render({ onExport });
    await act(async () => session.addSource("local-video"));
    let result: string | undefined;
    await act(async () => {
      result = await session.exportVideo("custom-storage", {
        resolution: 720,
        format: "mov",
      });
    });
    expect(result).toBe("custom-storage");
    expect(session.progress).toBe(100);
    expect(session.busy).toBe(null);
  });
  it.each(["document", "source", "readonly", "unmount"])(
    "aborts a pending export when %s changes",
    async (reason) => {
      let signal!: AbortSignal;
      const onExport: VideoEditorOptions["onExport"] = ({ signal: next }) => {
        signal = next;
        return new Promise((_resolve, reject) =>
          next.addEventListener("abort", () => reject(next.reason)),
        );
      };
      await render({ onExport });
      await act(async () => session.addSource("local-video"));
      let pending!: Promise<string | undefined>;
      await act(async () => {
        pending = session.exportVideo();
      });
      if (reason === "document")
        await act(async () => replace({ version: 1, clips: [] }));
      if (reason === "source") await render({ onExport, sources: [] });
      if (reason === "readonly") await render({ onExport, readOnly: true });
      if (reason === "unmount") {
        await act(async () => root.unmount());
        root = createRoot(document.createElement("div"));
      }
      await act(async () => {
        await pending;
      });
      expect(signal.aborted).toBe(true);
    },
  );
  it("isolates document history and selection across editor instances", async () => {
    let first!: ReturnType<typeof useVideoEditor>;
    let second!: ReturnType<typeof useVideoEditor>;
    function Pair() {
      const [left, setLeft] = useState(EMPTY_EDIT);
      const [right, setRight] = useState(EMPTY_EDIT);
      first = useVideoEditor({
        value: left,
        onChange: setLeft,
        sources,
        services,
      });
      second = useVideoEditor({
        value: right,
        onChange: setRight,
        sources,
        services,
      });
      return null;
    }
    await act(async () => root.render(<Pair />));
    await act(async () => first.addSource("local-video"));
    expect(first.canUndo).toBe(true);
    expect(first.selected).not.toBe(null);
    expect(second.doc).toBe(EMPTY_EDIT);
    expect(second.canUndo).toBe(false);
    expect(second.selected).toBe(null);
    await act(async () => second.addSource("local-music"));
    await act(async () => first.undo());
    expect(first.doc.clips).toHaveLength(0);
    expect(second.doc.clips[0].kind).toBe("audio");
  });
  it("prevents edits and imports in read-only mode", async () => {
    await render({ readOnly: true, autoImport: true });
    await act(async () => session.addSource("local-video"));
    await act(async () => session.commit({ version: 1, clips: [] }));
    expect(changes).not.toHaveBeenCalled();
    expect(services.loadSource).not.toHaveBeenCalled();
  });
});

it("retries failed sources explicitly and after reconnect, without looping automatically", async () => {
  services.loadSource.mockRejectedValueOnce(new Error("network error"));
  await render({ autoImport: true });
  expect(session.doc.clips.map((clip) => clip.kind)).toEqual(["audio"]);
  expect(session.canRetryImport).toBe(true);
  expect(services.loadSource).toHaveBeenCalledTimes(2);
  await act(async () => session.retryImport());
  expect(session.doc.clips.map((clip) => clip.kind)).toEqual([
    "audio",
    "video",
  ]);
  expect(session.canRetryImport).toBe(false);
  expect(session.error).toBeNull();
  await act(async () => session.undo());
  await render({ autoImport: true, sources: [sources[1]] });
  await render({ autoImport: true });
  expect(services.loadSource).toHaveBeenCalledTimes(3);
});

it("allows reconnection to retry an unsuccessful import", async () => {
  services.loadSource.mockRejectedValueOnce(new Error("network error"));
  await render({ autoImport: true });
  await render({ autoImport: true, sources: [sources[1]] });
  await render({ autoImport: true });
  expect(session.doc.clips).toHaveLength(2);
  expect(services.loadSource).toHaveBeenCalledTimes(3);
  expect(session.canRetryImport).toBe(false);
});

it("guards subtitle counts for any commit without blocking edits to existing documents", async () => {
  const { createSubtitle } = await import("../subtitles");
  await render();
  const cues = Array.from({ length: 500 }, (_, i) =>
    createSubtitle(`s${i}`, "Subtitle", i, 1),
  );
  await act(async () => replace({ version: 1, clips: cues }));
  const full = session.doc;
  await act(async () =>
    session.commit({
      ...full,
      clips: [...cues, createSubtitle("extra", "Extra", 0, 1)],
    }),
  );
  expect(session.doc).toBe(full);
  expect(session.error).toContain("500");
  await act(async () => session.updateClip({ ...cues[0], text: "Edited" }));
  expect(session.doc.clips[0]).toMatchObject({ text: "Edited" });
});

it("makes a cancelled import retryable without immediately restarting it", async () => {
  const loadSource = vi.fn(
    async (source: VideoEditorSource, signal: AbortSignal) => {
      if (loadSource.mock.calls.length === 1) {
        await new Promise((_resolve, reject) =>
          signal.addEventListener("abort", () => reject(signal.reason), {
            once: true,
          }),
        );
      }
      return { ...source, duration: 5, width: 1920, height: 1080 };
    },
  );
  await render({
    autoImport: true,
    sources: [sources[0]],
    services: { loadSource },
  });
  expect(session.busy).toBe("import");
  await act(async () => session.cancel());
  expect(session.busy).toBeNull();
  expect(session.canRetryImport).toBe(true);
  expect(loadSource).toHaveBeenCalledTimes(1);
  await act(async () => session.retryImport());
  expect(session.doc.clips).toHaveLength(1);
  expect(loadSource).toHaveBeenCalledTimes(2);
});

it("starts a new clip-local fade when the user changes a split clip fade setting", async () => {
  await render();
  await act(async () => session.addSource("local-music"));
  const clip = session.doc.clips[0];
  if (clip.kind === "text") throw new Error("Expected audio");
  await act(async () =>
    replace({
      ...session.doc,
      clips: [
        { ...clip, fadeIn: 4, in: 2, fadeRange: { in: 0, out: 5, speed: 1 } },
      ],
    }),
  );
  const split = session.doc.clips[0];
  if (split.kind === "text") throw new Error("Expected audio");
  await act(async () => session.updateClip({ ...split, fadeIn: 1 }));
  expect(session.doc.clips[0]).toMatchObject({
    fadeIn: 1,
    fadeRange: undefined,
  });
});
