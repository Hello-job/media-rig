"use client";

import { Button } from "../motion/button/base";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Check, Loader2, Magnet, Repeat2, X } from "lucide-react";
import { TrimLocaleContext, useTrimLabels, type VideoTrimLocale } from "./labels";
import { useTrimPreview } from "./use-trim-preview";
import { createThumbnailStrip } from "./thumbnail-strip";
import { VideoTrimSelection } from "./video-trim-selection";
import { trimVideo } from "./trim-video";
import type { VideoTrimRange } from "./trim-range";
import "./video-trim.css";

export interface VideoTrimResult {
  range: VideoTrimRange;
  duration: number;
  width: number;
  height: number;
}
export interface VideoTrimProps {
  /** Source URL or object URL. Remote sources must allow CORS. */
  src: string;
  poster?: string;
  /** Receives an MP4 blob; the host owns downloading or uploading it. */
  onExport: (blob: Blob, result: VideoTrimResult) => void | Promise<void>;
  onRangeChange?: (range: VideoTrimRange) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  locale?: VideoTrimLocale;
  className?: string;
  style?: CSSProperties;
}

export default function VideoTrim(props: VideoTrimProps) {
  return <TrimLocaleContext.Provider value={props.locale ?? "zh-CN"}>
    <VideoTrimPlayer key={props.src} {...props} />
  </TrimLocaleContext.Provider>;
}

function VideoTrimPlayer(props: VideoTrimProps) {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const t = useTrimLabels();
  return <section className={`media-rig-trim ${props.className ?? ""}`} style={props.style} aria-label={t("title")}>
    <video ref={setVideo} src={props.src} poster={props.poster} crossOrigin="anonymous" controls playsInline preload="metadata" aria-label={t("title")} />
    {video && <TrimControls {...props} video={video} />}
  </section>;
}

function TrimControls({ src, video, onExport, onRangeChange, onError, onClose }: VideoTrimProps & { video: HTMLVideoElement }) {
  const t = useTrimLabels();
  const [loop, setLoop] = useState(true);
  const [snap, setSnap] = useState(false);
  const trim = useTrimPreview(video, loop);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const job = useRef<AbortController | null>(null);
  const callbacks = useRef({ onExport, onRangeChange, onError, onClose });
  useEffect(() => { callbacks.current = { onExport, onRangeChange, onError, onClose }; });
  useEffect(() => {
    const abort = new AbortController();
    void createThumbnailStrip(src, abort.signal).then(images => {
      if (!abort.signal.aborted) setThumbnails(images);
    }).catch(() => { if (!abort.signal.aborted) setThumbnailError(true); });
    return () => { abort.abort(); job.current?.abort(); video.pause(); };
  }, [src, video]);
  useEffect(() => {
    if (trim.duration > 0) callbacks.current.onRangeChange?.([...trim.range]);
  }, [trim.duration, trim.range]);
  useEffect(() => {
    if (trim.error) callbacks.current.onError?.(new Error("Could not load or play video"));
  }, [trim.error]);
  useEffect(() => {
    if (!onClose) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { job.current?.abort(); callbacks.current.onClose?.(); }
    };
    // Scoped to this component so multiple embedded editors do not close together.
    const root = video.parentElement;
    root?.addEventListener("keydown", escape);
    return () => root?.removeEventListener("keydown", escape);
  }, [onClose, video]);
  const cancel = () => {
    job.current?.abort();
    job.current = null;
    setBusy(false);
    setProgress(null);
  };
  const generate = async () => {
    if (job.current || trim.error || trim.duration <= 0) return;
    const controller = new AbortController();
    job.current = controller;
    const range: VideoTrimRange = [...trim.range];
    setBusy(true); setFailed(false); setProgress(null); video.pause();
    try {
      const blob = await trimVideo({ src, range, signal: controller.signal, onProgress: value => {
        if (!controller.signal.aborted) setProgress(value);
      } });
      controller.signal.throwIfAborted();
      await callbacks.current.onExport(blob, { range, duration: range[1] - range[0], width: Math.ceil(video.videoWidth / 2) * 2, height: Math.ceil(video.videoHeight / 2) * 2 });
    } catch (cause) {
      if (!controller.signal.aborted) {
        setFailed(true);
        callbacks.current.onError?.(cause instanceof Error ? cause : new Error(String(cause)));
      }
    } finally {
      if (job.current === controller) { job.current = null; if (!controller.signal.aborted) setBusy(false); }
    }
  };
  const ready = trim.duration > 0 && !trim.error;
  const label = busy ? progress === null ? t("preparing") : t("generating", { percent: progress }) : t("generate");
  return <div className="media-rig-trim__panel">
    <div className="media-rig-trim__toolbar">
      {onClose && <Button variant="ghost" size="icon" type="button" className="media-rig-trim__icon" aria-label={t("cancel")} title={t("cancel")} onClick={() => { cancel(); onClose(); }}><X size={17} /></Button>}
      <div className="media-rig-trim__timeline-wrap">
        <div className="media-rig-trim__timeline">
          <div className="media-rig-trim__thumbnails" aria-hidden="true">
            {thumbnails.map((url, index) => <img key={index} src={url} alt="" draggable={false} />)}
            {ready && <>
              <div className="media-rig-trim__shade" style={{ left: 0, width: `${trim.range[0] / trim.duration * 100}%` }} />
              <div className="media-rig-trim__shade" style={{ right: 0, width: `${(1 - trim.range[1] / trim.duration) * 100}%` }} />
            </>}
          </div>
          {ready && <VideoTrimSelection range={trim.range} duration={trim.duration} snap={snap} disabled={busy} onChange={trim.changeRange} onDragStart={trim.beginDrag} onDragEnd={trim.endDrag} />}
          {!ready && !trim.error && <span role="status" className="media-rig-trim__loading">{t("loading")}</span>}
        </div>
        {ready && <div className="media-rig-trim__times"><span>{trim.range[0].toFixed(2)} s</span><span>{trim.range[1].toFixed(2)} s</span></div>}
      </div>
      <div className="media-rig-trim__actions">
        <Button variant="ghost" size="icon" type="button" className="media-rig-trim__icon" aria-label={t(snap ? "disableSnap" : "enableSnap")} title={t(snap ? "disableSnap" : "enableSnap")} aria-pressed={snap} disabled={busy} onClick={() => setSnap(!snap)}><Magnet size={17} /></Button>
        <Button variant="ghost" size="icon" type="button" className="media-rig-trim__icon" aria-label={t(loop ? "disableLoop" : "enableLoop")} title={t(loop ? "disableLoop" : "enableLoop")} aria-pressed={loop} disabled={busy} onClick={() => setLoop(!loop)}><Repeat2 size={18} /></Button>
        <Button variant="ghost" size="icon" type="button" className="media-rig-trim__icon media-rig-trim__confirm" aria-label={label} title={label} aria-busy={busy} disabled={!ready || busy} onClick={() => void generate()}>{busy ? <Loader2 size={18} className="media-rig-trim__spinner" /> : <Check size={18} />}</Button>
        {busy && <Button variant="ghost" size="icon" type="button" className="media-rig-trim__icon" aria-label={t("cancelExport")} title={t("cancelExport")} onClick={cancel}><X size={17} /></Button>}
      </div>
    </div>
    {busy && <p role="status">{label}</p>}
    {failed && <p role="alert">{t("error")}</p>}
    {trim.error && <p role="alert">{t("mediaError")}</p>}
    {thumbnailError && <p role="status">{t("thumbnailError")}</p>}
  </div>;
}
