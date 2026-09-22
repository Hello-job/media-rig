import { createContext, useContext } from "react";

const zh = {
  title: "片段截取", cancel: "取消截取", start: "截取起点", end: "截取终点", move: "移动选区", seconds: "{seconds} 秒",
  enableSnap: "开启整数秒吸附", disableSnap: "关闭整数秒吸附", enableLoop: "开启选区循环播放", disableLoop: "关闭选区循环播放",
  generate: "生成片段", loading: "正在读取视频…", preparing: "正在加载截取引擎…", generating: "正在截取… {percent}%",
  error: "截取失败，请检查视频是否可访问后重试，或尝试更小的视频。", mediaError: "无法读取或播放视频，请更换视频后重试。",
  thumbnailError: "缩略图暂不可用，仍可调整选区并预览。", cancelExport: "取消生成",
};
const en: typeof zh = {
  title: "Video trim", cancel: "Close trim", start: "Trim start", end: "Trim end", move: "Move selection", seconds: "{seconds} s",
  enableSnap: "Enable whole-second snapping", disableSnap: "Disable whole-second snapping", enableLoop: "Enable selection loop", disableLoop: "Disable selection loop",
  generate: "Generate clip", loading: "Loading video…", preparing: "Loading video engine…", generating: "Trimming… {percent}%",
  error: "Could not export. Check the video URL or try a smaller video.", mediaError: "Could not load or play this video. Try another video.",
  thumbnailError: "Thumbnails unavailable. You can still adjust and preview the selection.", cancelExport: "Cancel export",
};
export type VideoTrimLocale = "zh-CN" | "en-US";
export const TrimLocaleContext = createContext<VideoTrimLocale>("zh-CN");
export function useTrimLabels() {
  const dictionary = useContext(TrimLocaleContext) === "en-US" ? en : zh;
  return (key: string, values: Record<string, string | number> = {}) => {
    const label = dictionary[key.replace("videoTrim.", "") as keyof typeof zh] ?? key;
    return label.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? ""));
  };
}
