"use client";

import { useEffect, useRef, useState } from "react";
import { VideoEditor, EMPTY_EDIT, type VideoEditorSource } from "media-rig/video-editor";
import { useLocale } from "@/i18n/LocaleProvider";

export default function VideoEditorPreview() {
  const { t } = useLocale();
  const [document, setDocument] = useState(EMPTY_EDIT);
  const [sources, setSources] = useState<VideoEditorSource[]>([
    {
      id: "demo-video",
      url: "https://pub-1e3b85b4fe444190a938e0f68a2eb8b8.r2.dev/15_1789368851(%E5%8E%9F%E8%A7%86%E9%A2%91).mp4",
      label: "15_1789368851(原视频).mp4",
      kind: "video",
    },
  ]);
  const urls = useRef<string[]>([]);
  useEffect(() => () => { urls.current.forEach(url => URL.revokeObjectURL(url)); }, []);
  return <div className="w-full space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
      <p>{t("添加视频或音频，开始剪辑；支持文字、字幕和撤销重做。")}</p>
      <label className="cursor-pointer rounded-lg border border-white/20 px-3 py-2 text-white focus-within:outline focus-within:outline-white">
        {t("添加素材")}
        <input type="file" accept="video/*,audio/*" multiple className="sr-only" onChange={event => {
          const added = Array.from(event.target.files ?? []).map(file => {
            const url = URL.createObjectURL(file);
            urls.current.push(url);
            return { id: crypto.randomUUID(), url, label: file.name, kind: file.type.startsWith("audio/") ? "audio" as const : "video" as const };
          });
          setSources(previous => [...previous, ...added]);
          event.target.value = "";
        }} />
      </label>
    </div>
    <div style={{ height: 720 }}>
      <VideoEditor value={document} onChange={setDocument} sources={sources} autoImport />
    </div>
    <p className="text-xs text-white/45">{t("素材仅在浏览器本地使用。此演示展示剪辑功能，视频编码与保存可通过 onExport 接入。")}</p>
  </div>;
}
