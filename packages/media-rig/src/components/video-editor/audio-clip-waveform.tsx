import { memo, useEffect, useRef, useState } from "react";
import { useVideoEditorServices } from "./video-editor-context";
import type { MediaClip } from "./types";

function AudioClipWaveformView({ clip }: { clip: MediaClip }) {
  const { loadWaveform } = useVideoEditorServices();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveform, setWaveform] = useState<{
    url: string;
    peaks: number[];
  } | null>(null);
  useEffect(() => {
    if (!loadWaveform) return;
    let active = true;
    void loadWaveform(clip.source.url)
      .then((peaks) => {
        if (active) setWaveform({ url: clip.source.url, peaks });
      })
      .catch(() => {
        // The clip remains editable if optional waveform decoding is unavailable.
      });
    return () => {
      active = false;
    };
  }, [clip.source.url, loadWaveform]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveform || waveform.url !== clip.source.url) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const from = Math.floor(
      (clip.in / clip.source.duration) * waveform.peaks.length,
    );
    const to = Math.max(
      from + 1,
      Math.ceil((clip.out / clip.source.duration) * waveform.peaks.length),
    );
    const peaks = waveform.peaks.slice(from, to);
    const peakMax = Math.max(0.01, ...peaks);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = getComputedStyle(canvas)
      .getPropertyValue("--edit-waveform")
      .trim();
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    peaks.forEach((peak, i) =>
      ctx.lineTo(
        (i / Math.max(1, peaks.length - 1)) * canvas.width,
        canvas.height - Math.max(1, (peak / peakMax) * (canvas.height - 4)),
      ),
    );
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
  }, [waveform, clip.in, clip.out, clip.source.duration, clip.source.url]);
  return (
    <>
      {(!waveform || waveform.url !== clip.source.url) && (
        <span className="truncate px-3 text-[color:var(--ui-text-secondary)]">
          {clip.source.label}
        </span>
      )}
      <canvas
        ref={canvasRef}
        width={1200}
        height={48}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </>
  );
}

export const AudioClipWaveform = memo(AudioClipWaveformView);
