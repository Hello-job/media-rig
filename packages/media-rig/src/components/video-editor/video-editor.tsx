import { useMemo } from "react";
import { createThumbnailStrip } from "./thumbnail-strip";
import { VideoEditorContext, defaultTranslate } from "./video-editor-context";
import { VideoEditorPanel } from "./video-editor-panel";
import { useVideoEditor } from "./use-video-editor";
import type { VideoEditorProps } from "./types";

/** Controlled editor: the host owns persistence, asset loading and export destinations. */
export function VideoEditor(props: VideoEditorProps) {
  const session = useVideoEditor(props);
  const context = useMemo(
    () => ({
      t: props.translate ?? defaultTranslate,
      services: { loadThumbnails: createThumbnailStrip, ...props.services },
    }),
    [props.translate, props.services],
  );
  return (
    <VideoEditorContext.Provider value={context}>
      <VideoEditorPanel
        session={session}
        onClose={props.onClose}
        exportActions={props.exportActions}
        recommendedResolution={props.recommendedResolution}
        className={props.className}
      />
    </VideoEditorContext.Provider>
  );
}
