import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { defaultTranslate } from "./video-editor-context";
import { editDuration, normalizeEdit } from "./timeline";
import {
  rememberedSources,
  sourceKey,
  useConnectedSources,
} from "./use-connected-sources";
import { loadEditSource } from "./media-metadata";
import { isSubtitle, MAX_SUBTITLES, updateEditClip } from "./subtitles";
import type {
  EditClip,
  VideoEditDocument,
  VideoEditorOptions,
  VideoEditorExportSettings,
} from "./types";

export function useVideoEditor({
  value: doc,
  sources,
  onChange,
  readOnly = false,
  autoImport = false,
  services = {},
  translate: t = defaultTranslate,
  onExport,
}: VideoEditorOptions) {
  const [selected, setSelected] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState<"import" | "export" | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [failedImports, setFailedImports] = useState<string[]>([]);
  const [history, setHistory] = useState<{
    present: VideoEditDocument;
    past: VideoEditDocument[];
    future: VideoEditDocument[];
  }>({ present: doc, past: [], future: [] });
  const job = useRef<AbortController | null>(null);
  const jobBasis = useRef<{
    doc: VideoEditDocument;
    sources: { id: string; url: string }[];
  } | null>(null);
  const missing = doc.clips.some(
    (c) =>
      c.kind !== "text" &&
      !sources.some((s) => s.id === c.source.id && s.url === c.source.url),
  );
  useLayoutEffect(() => {
    const basis = jobBasis.current;
    if (
      job.current &&
      basis &&
      (readOnly ||
        basis.doc !== doc ||
        basis.sources.some(
          (source) =>
            !sources.some(
              (item) => item.id === source.id && item.url === source.url,
            ),
        ))
    )
      job.current.abort();
  }, [doc, sources, readOnly]);
  useEffect(
    () => () => {
      job.current?.abort();
    },
    [],
  );
  const stop = useCallback(() => setPlaying(false), []);
  const previewError = useCallback(
    () => setError(t("videoEditor.mediaError")),
    [t],
  );
  const write = (next: VideoEditDocument) => {
    if (readOnly) return;
    onChange(next);
    setPlaying(false);
    setTime((current) => Math.min(current, editDuration(next)));
  };
  const commit = (next: VideoEditDocument) => {
    if (readOnly || job.current || next === doc) return;
    const subtitleCount = next.clips.filter(isSubtitle).length;
    if (
      subtitleCount > MAX_SUBTITLES &&
      subtitleCount > doc.clips.filter(isSubtitle).length
    ) {
      setError(t("videoEditor.subtitleLimit", { count: MAX_SUBTITLES }));
      return;
    }
    const normalized = normalizeEdit({
      ...next,
      importedSources: [
        ...new Set([...rememberedSources(doc), ...rememberedSources(next)]),
      ],
    });
    setHistory((h) => ({
      present: normalized,
      past: [...(h.present === doc ? h.past : []), doc].slice(-50),
      future: [],
    }));
    write(normalized);
  };
  const undo = () => {
    if (readOnly || history.present !== doc || !history.past.length || busy)
      return;
    const next = {
      ...history.past[history.past.length - 1]!,
      importedSources: rememberedSources(doc),
    };
    setHistory({
      present: next,
      past: history.past.slice(0, -1),
      future: [doc, ...history.future],
    });
    write(next);
  };
  const redo = () => {
    if (readOnly || history.present !== doc || !history.future.length || busy)
      return;
    const next = {
      ...history.future[0],
      importedSources: rememberedSources(doc),
    };
    setHistory({
      present: next,
      past: [...history.past, doc],
      future: history.future.slice(1),
    });
    write(next);
  };
  const updateClip = (clip: EditClip) => {
    const original = doc.clips.find((item) => item.id === clip.id);
    if (
      clip.kind !== "text" &&
      original &&
      original.kind !== "text" &&
      (clip.fadeIn !== original.fadeIn || clip.fadeOut !== original.fadeOut)
    ) {
      commit(updateEditClip(doc, { ...clip, fadeRange: undefined }));
      return;
    }
    commit(updateEditClip(doc, clip));
  };
  const addSource = async (id: string, automatic = false) => {
    if (job.current || readOnly) return;
    const source = sources.find((s) => s.id === id);
    if (!source?.url || (source.kind !== "video" && source.kind !== "audio"))
      return;
    const controller = new AbortController();
    const key = sourceKey(source.id, source.url);
    job.current = controller;
    jobBasis.current = { doc, sources: [{ id: source.id, url: source.url }] };
    setBusy("import");
    if (!automatic) setError(null);
    setPlaying(false);
    try {
      const media = await (services.loadSource ?? loadEditSource)(
        {
          id: source.id,
          label: source.label,
          url: source.url,
          kind: source.kind,
        },
        controller.signal,
      );
      controller.signal.throwIfAborted();
      const clip: EditClip = {
        id: crypto.randomUUID(),
        kind: media.kind,
        source: media,
        start: media.kind === "audio" && !automatic ? time : 0,
        in: 0,
        out: media.duration,
        speed: 1,
        volume: 1,
        muted: false,
        fadeIn: 0,
        fadeOut: 0,
      };
      job.current = null;
      commit({ ...doc, clips: [...doc.clips, clip] });
      setFailedImports((failed) => failed.filter((item) => item !== key));
      if (
        !failedImports.some(
          (item) =>
            item !== key &&
            sources.some((source) => sourceKey(source.id, source.url) === item),
        )
      )
        setError(null);
      setSelected(clip.id);
    } catch {
      setFailedImports((failed) => [...new Set([...failed, key])]);
      if (!controller.signal.aborted) setError(t("videoEditor.mediaError"));
    } finally {
      if (job.current === controller) job.current = null;
      setBusy(null);
    }
  };
  useConnectedSources({
    doc,
    sources,
    disabled: !autoImport || Boolean(busy) || readOnly,
    addSource: (id) => addSource(id, true),
  });
  const exportVideo = async (
    destination = "download",
    settings: VideoEditorExportSettings = { resolution: 1080, format: "mp4" },
  ) => {
    if (job.current || readOnly || missing || !onExport) return;
    const controller = new AbortController();
    job.current = controller;
    jobBasis.current = {
      doc,
      sources: doc.clips.flatMap((c) =>
        c.kind === "text" ? [] : [{ id: c.source.id, url: c.source.url }],
      ),
    };
    setBusy("export");
    setProgress(0);
    setError(null);
    setPlaying(false);
    try {
      const result = await onExport({
        document: doc,
        settings,
        destination,
        signal: controller.signal,
        onProgress: setProgress,
      });
      controller.signal.throwIfAborted();
      setProgress(100);
      return result ?? destination;
    } catch {
      if (!controller.signal.aborted) setError(t("videoEditor.exportError"));
    } finally {
      if (job.current === controller) job.current = null;
      setBusy(null);
    }
  };
  const cancel = useCallback(() => job.current?.abort(), []);
  const remembered = new Set(rememberedSources(doc));
  const retrySource = sources.find((source) => {
    const key = sourceKey(source.id, source.url);
    return failedImports.includes(key) && !remembered.has(key);
  });
  return {
    doc,
    sources,
    selected,
    setSelected,
    time,
    setTime,
    playing,
    setPlaying,
    stop,
    previewError,
    busy,
    progress,
    error,
    canRetryImport: Boolean(retrySource),
    retryImport: () => retrySource && addSource(retrySource.id),
    missing,
    readOnly,
    canExport: Boolean(onExport),
    commit,
    updateClip,
    addSource,
    exportVideo,
    undo,
    redo,
    canUndo: history.present === doc && history.past.length > 0,
    canRedo: history.present === doc && history.future.length > 0,
    cancel,
  };
}
