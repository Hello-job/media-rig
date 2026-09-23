import { useEffect, useRef } from "react";
import type { VideoEditorSource } from "./types";
import type { VideoEditDocument } from "./types";

export function sourceKey(id: string, url: string) {
  return JSON.stringify([id, url]);
}

export function rememberedSources(doc: VideoEditDocument) {
  return [
    ...new Set([
      ...(doc.importedSources ?? []),
      ...doc.clips.flatMap((clip) =>
        clip.kind === "text"
          ? []
          : [sourceKey(clip.source.id, clip.source.url)],
      ),
    ]),
  ];
}

export function useConnectedSources({
  doc,
  sources,
  disabled,
  addSource,
}: {
  doc: VideoEditDocument;
  sources: VideoEditorSource[];
  disabled: boolean;
  addSource: (id: string) => Promise<void>;
}) {
  const attempted = useRef(new Set(rememberedSources(doc)));
  useEffect(() => {
    const remembered = new Set(rememberedSources(doc));
    const connected = new Set(
      sources.map((source) => sourceKey(source.id, source.url)),
    );
    for (const key of attempted.current)
      if (!connected.has(key) && !remembered.has(key))
        attempted.current.delete(key);
    for (const key of remembered) attempted.current.add(key);
    if (disabled) return;
    const source = sources.find(
      (item) =>
        item.url &&
        !remembered.has(sourceKey(item.id, item.url)) &&
        !attempted.current.has(sourceKey(item.id, item.url)),
    );
    if (!source?.url) return;
    // Defer until effect setup settles so StrictMode cleanup cannot consume an import.
    let cancelled = false;
    const key = sourceKey(source.id, source.url);
    queueMicrotask(() => {
      if (cancelled) return;
      attempted.current.add(key);
      void addSource(source.id);
    });
    return () => {
      cancelled = true;
    };
  }, [doc, sources, disabled, addSource]);
}
