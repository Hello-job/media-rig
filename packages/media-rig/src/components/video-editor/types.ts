export type EditSource = {
  id: string;
  url: string;
  label: string;
  kind: "video" | "audio";
  duration: number;
  width: number;
  height: number;
};

export type MediaClip = {
  id: string;
  kind: "video" | "audio";
  source: EditSource;
  trackId?: string;
  transform?: { x: number; y: number; scale: number };
  start: number;
  in: number;
  out: number;
  speed: number;
  volume: number;
  muted: boolean;
  fadeIn: number;
  fadeOut: number;
  /** Original source interval used to preserve fades across cuts. */
  fadeRange?: { in: number; out: number; speed: number };
};

export type TextClip = {
  id: string;
  kind: "text";
  textType?: "subtitle";
  start: number;
  duration: number;
  text: string;
  trackId?: string;
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  fontSize: number;
  color: string;
  x: number;
  y: number;
};

export type SubtitleClip = TextClip & { textType: "subtitle" };

export type EditClip = MediaClip | TextClip;
export type VideoEditDocument = {
  version: 1;
  importedSources?: string[];
  clips: EditClip[];
  tracks?: Record<string, { hidden?: boolean; muted?: boolean }>;
};

export type VideoEditorSource = Pick<
  EditSource,
  "id" | "url" | "label" | "kind"
>;
export type VideoEditorTranslate = (
  key: string,
  values?: Record<string, string | number>,
) => string;
export type VideoEditorServices = {
  loadSource?: (
    source: VideoEditorSource,
    signal: AbortSignal,
  ) => Promise<EditSource>;
  loadThumbnails?: (url: string, signal: AbortSignal) => Promise<string[]>;
  loadWaveform?: (url: string) => Promise<number[]>;
};
export type VideoEditorExportSettings = {
  resolution: 480 | 720 | 1080;
  format: "mp4" | "mov";
};
export type VideoEditorExportRequest = {
  settings: VideoEditorExportSettings;
  document: VideoEditDocument;
  destination: string;
  signal: AbortSignal;
  onProgress: (percent: number) => void;
};
export type VideoEditorOptions = {
  value: VideoEditDocument;
  sources: VideoEditorSource[];
  onChange: (document: VideoEditDocument) => void;
  readOnly?: boolean;
  autoImport?: boolean;
  services?: VideoEditorServices;
  translate?: VideoEditorTranslate;
  onExport?: (request: VideoEditorExportRequest) => Promise<string | void>;
};
export type VideoEditorProps = VideoEditorOptions & {
  className?: string;
  recommendedResolution?: VideoEditorExportSettings["resolution"];
  exportActions?: { id: string; label: string }[];
  onClose?: () => void;
};
