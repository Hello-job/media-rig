"use client";
import { useLocale } from "@/i18n/LocaleProvider";


import { useEffect, useState } from "react";
import { VideoTrim, type VideoTrimResult } from "media-rig/video-trim";

export default function VideoTrimPreview() {
  const { t, locale } = useLocale();
  const [source, setSource] = useState("https://pub-1e3b85b4fe444190a938e0f68a2eb8b8.r2.dev/15_1789368851(%E5%8E%9F%E8%A7%86%E9%A2%91).mp4");
  const [result, setResult] = useState<{ url: string; info: VideoTrimResult } | null>(null);
  useEffect(() => () => { if (source.startsWith("blob:")) URL.revokeObjectURL(source); }, [source]);
  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);
  return <div className="mx-auto w-full max-w-[860px] space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
      <p>{t("拖动两端选择片段，拖动中间移动选区。")}</p>
      <label className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-white/80 focus-within:outline focus-within:outline-white">
        {t("选择视频")}
        <input type="file" accept="video/*" className="sr-only" onChange={event => {
          const file = event.target.files?.[0];
          if (file) { setSource(URL.createObjectURL(file)); setResult(null); }
          event.target.value = "";
        }} />
      </label>
    </div>
    <VideoTrim locale={locale} src={source} poster={source.startsWith("blob:") ? undefined : "/assets/video-trim/poster.jpg"} onExport={(blob, info) => setResult({ url: URL.createObjectURL(blob), info })} />
    {result && <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3 text-xs">
        <p role="status">{t("片段已生成 ·")} {result.info.duration.toFixed(2)} {t("秒")}</p>
        <a href={result.url} download="media-rig-clip.mp4" className="rounded-lg bg-white px-3 py-2 font-medium text-black">{t("下载 MP4")}</a>
      </div>
      <video src={result.url} controls playsInline className="max-h-64 w-full rounded-lg bg-black" aria-label={t("截取结果")} />
    </div>}
  </div>;
}
