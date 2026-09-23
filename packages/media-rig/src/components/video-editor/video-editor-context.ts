import { createContext, useContext } from "react";
import type { VideoEditorServices, VideoEditorTranslate } from "./types";
import { defaultMessages } from "./messages";

export const defaultTranslate: VideoEditorTranslate = (key, values) => {
  const message =
    defaultMessages[
      key.replace(/^videoEditor\./, "") as keyof typeof defaultMessages
    ] ?? key;
  return message.replace(/\{(\w+)\}/g, (token, name: string) =>
    String(values?.[name] ?? token),
  );
};
export const VideoEditorContext = createContext<{
  t: VideoEditorTranslate;
  services: VideoEditorServices;
}>({ t: defaultTranslate, services: {} });
export function useI18n() {
  return useContext(VideoEditorContext);
}
export function useVideoEditorServices() {
  return useContext(VideoEditorContext).services;
}
