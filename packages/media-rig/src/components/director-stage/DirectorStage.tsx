import { Input } from "../motion/input";
import { Button } from "../motion/button/base";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Download, Layers3, Search, X } from "lucide-react";
import { recordDirectorVideo } from "./record-video";
import DirectorTimeline from "./DirectorTimeline";
import { sampleCameraMotion } from "./DirectorStage.motion";
import DirectorStageCanvas from "./DirectorStageCanvas";
import { DEFAULT_COMPOSITION } from "./DirectorStage.constants";
import { EnvironmentInspector, SelectionInspector } from "./DirectorStage.inspectors";
import type { SceneItem, ToolMenu } from "./DirectorStage.sceneTypes";
import { BottomTools, ViewportToolbar } from "./DirectorStage.toolbars";
import { downloadText, parseSceneSeed, ratioToNumber, type AspectRatio } from "./DirectorStage.utils";
import SceneTree from "./SceneTree";
import { useDirectorStage } from "./hooks/useDirectorStage";
import type {
  DirectorCamera,
  DirectorCharacter,
  DirectorPropType,
  DirectorStageProps,
  DirectorTransformMode,
  ParsedSceneSeed,
} from "./DirectorStage.types";
import "./DirectorStage.css";

const SAMPLE_SEED: ParsedSceneSeed = DEFAULT_COMPOSITION;

export default function DirectorStage({
  className,
  style,
  initialComposition,
  storageKey = "media-rig-director-stage-dark-v3",
  onCompositionChange,
  onCapture,
  onClose,
}: DirectorStageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, dispatch } = useDirectorStage(initialComposition, storageKey);
  const viewRef = useRef<Pick<DirectorCamera, "position" | "lookAt" | "fov"> | null>(null);
  const uploadUrls = useRef<string[]>([]);
  const exportController = useRef<AbortController | null>(null);
  const [exporting, setExporting] = useState(false);
  useEffect(() => () => exportController.current?.abort(), []);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [motionTime, setMotionTime] = useState(0);
  const [motionPlaying, setMotionPlaying] = useState(false);
  const motions = state.composition.cameraMotions ?? [];
  const motionDuration = Math.max(6, ...motions.map((motion) => motion.start + motion.duration));
  useEffect(() => {
    if (!motionPlaying) return;
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const delta = (now - previous) / 1000; previous = now;
      setMotionTime((time) => Math.min(motionDuration, time + delta));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [motionPlaying, motionDuration]);
  useEffect(() => { if (motionTime >= motionDuration) setMotionPlaying(false); }, [motionTime, motionDuration]);
  const currentMotion = timelineOpen ? [...motions].reverse().find((motion) => motionTime >= motion.start && motionTime <= motion.start + motion.duration) : undefined;
  const previewComposition = currentMotion ? { ...state.composition, cameras: state.composition.cameras.map((camera) => camera.id === currentMotion.cameraId ? sampleCameraMotion(currentMotion, motionTime) : camera) } : state.composition;
  const [query, setQuery] = useState("");
  const [shots, setShots] = useState<Array<{ url: string; label: string }>>([]);
  const [status, setStatus] = useState("");
  useEffect(() => () => uploadUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);
  const [openMenu, setOpenMenu] = useState<ToolMenu>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("Auto");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [jsonDraft, setJsonDraft] = useState(() => JSON.stringify(SAMPLE_SEED, null, 2));
  const [jsonMessage, setJsonMessage] = useState("可粘贴角色、道具、机位 JSON");

  useEffect(() => {
    onCompositionChange?.(state.composition);
  }, [onCompositionChange, state.composition]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (exporting) return;
      if (!rootRef.current?.contains(target) || target?.isContentEditable || event.ctrlKey || event.metaKey || event.altKey) return;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.code === "Space" && timelineOpen && motions.length && !exporting) {
        event.preventDefault(); if (motionTime >= motionDuration) setMotionTime(0);
        setMotionPlaying((playing) => !playing); dispatch({ type: "setViewMode", mode: "camera" }); return;
      }
      if (event.key === "Delete" || event.key === "Backspace") { event.preventDefault(); dispatch({ type: "removeSelected" }); }
      if (event.key.toLowerCase() === "v") dispatch({ type: "setTransformMode", mode: "translate" });
      if (event.key.toLowerCase() === "r") dispatch({ type: "setTransformMode", mode: "rotate" });
      if (event.key.toLowerCase() === "f") dispatch({ type: "setTransformMode", mode: "scale" });
      if (event.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, timelineOpen, motions.length, exporting, motionTime, motionDuration]);

  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const dismiss = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest(".director-stage__bottom-tools")) setOpenMenu(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [openMenu]);

  const selectedItem = useMemo<SceneItem | null>(() => {
    if (!state.selection) return null;
    if (state.selection.kind === "character") {
      const item = state.composition.characters.find((character) => character.id === state.selection?.id);
      return item ? { kind: "character", item } : null;
    }
    if (state.selection.kind === "prop") {
      const item = state.composition.props.find((prop) => prop.id === state.selection?.id);
      return item ? { kind: "prop", item } : null;
    }
    const item = state.composition.cameras.find((camera) => camera.id === state.selection?.id);
    return item ? { kind: "camera", item } : null;
  }, [state.composition, state.selection]);

  const captureCanvas = async () => {
    if (!state.composition.cameras.length) return;
    setMotionPlaying(false);
    dispatch({ type: "setViewMode", mode: "camera", cameraId: currentMotion?.cameraId ?? state.activeCameraId });
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const canvas = rootRef.current?.querySelector<HTMLCanvasElement>(".director-stage__viewport canvas");
    if (!canvas) return;
    let dataUrl: string;
    try {
      const ratio = ratioToNumber(aspectRatio);
      const output = document.createElement("canvas");
      const width = ratio ? Math.min(canvas.width, canvas.height * ratio) : canvas.width;
      const height = ratio ? width / ratio : canvas.height;
      output.width = Math.round(width); output.height = Math.round(height);
      output.getContext("2d")?.drawImage(canvas, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height, 0, 0, output.width, output.height);
      dataUrl = output.toDataURL("image/png");
    } catch { setStatus("截图失败，请检查导入模型的跨域资源"); return; }
    setShots((previous) => [{ url: dataUrl, label: `镜头 ${previous.length + 1} · ${aspectRatio}` }, ...previous].slice(0, 8));
    setStatus("截图已导出");
    onCapture?.(dataUrl);
    const anchor = document.createElement("a");
    anchor.download = "director-stage.png";
    anchor.href = dataUrl;
    anchor.click();
  };

  const exportVideo = async () => {
    if (!motions.length || exporting) return;
    const controller = new AbortController(); exportController.current = controller;
    setExporting(true); setMotionTime(0); setMotionPlaying(false);
    dispatch({ type: "setViewMode", mode: "camera" });
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const canvas = rootRef.current?.querySelector<HTMLCanvasElement>(".director-stage__viewport canvas");
      if (!canvas) throw new Error("画布未就绪");
      setMotionPlaying(true);
      const blob = await recordDirectorVideo(canvas, motionDuration, ratioToNumber(aspectRatio), controller.signal);
      const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `director-motion.${blob.type.includes("mp4") ? "mp4" : "webm"}`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setStatus("运镜视频已导出");
    } catch (error) { setStatus(error instanceof Error ? error.message : "视频导出失败"); }
    finally { setExporting(false); setMotionPlaying(false); exportController.current = null; }
  };

  const importJson = () => {
    try {
      dispatch({ type: "importSeed", seed: parseSceneSeed(jsonDraft) });
      setJsonMessage("已导入场景 seed");
    } catch (error) {
      setJsonMessage(error instanceof Error ? error.message : "JSON 格式不正确");
    }
  };

  const addUploadedModel = (file: File | undefined) => {
    if (!file) return;
    if (!/\.glb$/i.test(file.name)) { setStatus("请选择包含贴图的 GLB 文件"); return; }
    const url = URL.createObjectURL(file);
    uploadUrls.current.push(url);
    dispatch({ type: "addCharacter", modelUrl: url, label: file.name.replace(/\.(glb|gltf)$/i, "") || "自定义角色" });
    setOpenMenu(null);
  };

  const setMode = (mode: DirectorTransformMode) => {
    dispatch({ type: "setTransformMode", mode });
    setOpenMenu(null);
  };

  const addCharacter = (bodyType: DirectorCharacter["bodyType"], label?: string) => {
    dispatch({ type: "addCharacter", bodyType, label });
    setOpenMenu(null);
  };

  const addCrowd = () => {
    const spacing = 0.72;
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 3; col += 1) {
        dispatch({
          type: "addCharacter",
          bodyType: "mannequin",
          label: `群众 ${row * 3 + col + 1}`,
          position: { x: (col - 1) * spacing, y: 0, z: 0.8 + row * spacing },
        });
      }
    }
    setOpenMenu(null);
  };

  const addProp = (nextPropType: DirectorPropType, label?: string) => {
    dispatch({ type: "addProp", propType: nextPropType, label });
    setOpenMenu(null);
  };

  const addCamera = (camera?: Partial<DirectorCamera>) => {
    const focus = selectedItem?.kind === "character" || selectedItem?.kind === "prop" ? selectedItem.item.position : state.composition.characters[0]?.position;
    const offset = (value: DirectorCamera["position"]) => ({ x: value.x + (focus?.x ?? 0), y: value.y + (focus?.y ?? 0), z: value.z + (focus?.z ?? 0) });
    dispatch({ type: "addCamera", camera: camera?.label && camera.position && camera.lookAt ? { ...camera, position: offset(camera.position), lookAt: offset(camera.lookAt) } : camera });
    setOpenMenu(null);
  };

  const applyCurrentViewCamera = () => {
    addCamera(viewRef.current ?? undefined);
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await rootRef.current?.requestFullscreen();
      }
    } catch {
      // Browsers may reject fullscreen without a trusted user gesture.
    }
    setOpenMenu(null);
  };

  const aspectNumber = ratioToNumber(aspectRatio);
  const stageClassName = ["director-stage", isFullscreen ? "is-fullscreen" : "", className].filter(Boolean).join(" ");

  return (
    <div className={stageClassName} style={style} ref={rootRef} tabIndex={-1} onPointerDown={(event) => { if (!(event.target as HTMLElement).closest("button, input, select, textarea, a")) rootRef.current?.focus({ preventScroll: true }); }}>
      {exporting && <div className="director-stage__export-overlay" role="status"><span>正在导出运镜视频 · {Math.round(motionTime / motionDuration * 100)}%</span><Button variant="ghost" type="button" onClick={() => exportController.current?.abort()}>取消</Button></div>}
      <header className="director-stage__topbar">
        <div className="director-stage__brand">
          <h1>3D导演台</h1>
        </div>
        <div className="director-stage__top-actions">
          <span className="director-stage__status" role="status">{status}</span>
          {onClose && <Button variant="ghost" type="button" aria-label="关闭 3D 导演台" title="关闭 3D 导演台" onClick={onClose}><X size={16} /></Button>}
        </div>
      </header>

      <div className="director-stage__body">
        <aside className="director-stage__rail" aria-label="场景层级">
          <section>
            <div className="director-stage__hierarchy-heading"><Layers3 size={18} /><div><strong>场景层级</strong><small>{state.composition.characters.length + state.composition.cameras.length + state.composition.props.length} 个对象</small></div></div>
            <label className="director-stage__search">
              <Search size={16} />
              <Input aria-label="搜索场景对象" placeholder="搜索场景对象…" value={query} onChange={setQuery} classNames={{ field: "h-8 border-0 bg-transparent", input: "text-xs" }} />
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,model/gltf-binary"
              hidden
              onChange={(event) => { addUploadedModel(event.target.files?.[0]); event.target.value = ""; }}
            />
          </section>

          <section>
            <SceneTree
              composition={state.composition}
              query={query}
              selection={state.selection}
              onSelect={(selection) => dispatch({ type: "select", selection })}
              onDuplicate={(selection) => dispatch({ type: "duplicateItem", selection })}
              onRemove={(selection) => dispatch({ type: "removeItem", selection })}
              activeCameraId={currentMotion?.cameraId ?? state.activeCameraId}
              onRename={(selection, label) => {
                if (selection.kind === "character") dispatch({ type: "updateCharacter", id: selection.id, patch: { label } });
                else if (selection.kind === "prop") dispatch({ type: "updateProp", id: selection.id, patch: { label } });
                else dispatch({ type: "updateCamera", id: selection.id, patch: { label } });
              }}
              onToggleVisible={(selection, visible) => dispatch({ type: "setItemVisible", selection, visible })}
            />
          </section>
        </aside>

        <div className="director-stage__center">
        <main className="director-stage__viewport">
          <ViewportToolbar
            transformMode={state.transformMode}
            viewMode={state.viewMode}
            onRemoveSelected={() => dispatch({ type: "removeSelected" })}
            onSetTransformMode={(mode) => dispatch({ type: "setTransformMode", mode })}
            onSetViewMode={(mode) => dispatch({ type: "setViewMode", mode })}
          />

          <DirectorStageCanvas
            motionPath={currentMotion?.points}
            onViewChange={(camera) => { viewRef.current = camera; }}
            composition={previewComposition}
            selection={state.viewMode === "camera" ? null : state.selection}
            transformMode={state.transformMode}
            viewMode={state.viewMode}
            activeCameraId={currentMotion?.cameraId ?? state.activeCameraId}
            onSelect={(selection) => dispatch({ type: "select", selection })}
            onTransform={(transform) => dispatch({ type: "transformSelected", transform })}
          />

          {aspectNumber ? (
            <div className="director-stage__aspect-frame" style={{ aspectRatio: aspectNumber, width: `min(100%, calc((100cqh) * ${aspectNumber}))`, maxHeight: "100%", top: "50%" }} aria-hidden="true" />
          ) : null}

          <div className="director-stage__viewport-info"><span>{state.viewMode === "camera" ? "机位预览" : "场景视图"}</span><span>V 移动 · R 旋转 · F 缩放 · Delete 删除</span></div>
          <BottomTools
            timelineOpen={timelineOpen}
            onToggleTimeline={() => { setTimelineOpen(!timelineOpen); setMotionPlaying(false); setOpenMenu(null); }}
            onCapture={captureCanvas}
            aspectRatio={aspectRatio}
            isFullscreen={isFullscreen}
            openMenu={openMenu}
            transformMode={state.transformMode}
            onAddCamera={addCamera}
            onAddCharacter={addCharacter}
            onAddCrowd={addCrowd}
            onAddProp={addProp}
            onApplyCurrentViewCamera={applyCurrentViewCamera}
            onClickUpload={() => fileInputRef.current?.click()}
            onSetAspectRatio={setAspectRatio}
            onSetMode={setMode}
            onSetOpenMenu={setOpenMenu}
            onToggleFullscreen={toggleFullscreen}
          />
        </main>
        {timelineOpen && <DirectorTimeline cameras={state.composition.cameras} activeCameraId={state.activeCameraId} motions={motions} time={motionTime} playing={motionPlaying} onTime={setMotionTime} onPlaying={(playing) => { setMotionPlaying(playing); if (playing) dispatch({ type: "setViewMode", mode: "camera" }); }} onChange={(next) => dispatch({ type: "setCameraMotions", motions: next })} onClose={() => { setTimelineOpen(false); setMotionPlaying(false); }} onExport={exportVideo} />}
        </div>

        <aside className="director-stage__inspector" aria-label="属性检查器">
          <section><div className="director-stage__panel-title">机位切换</div><div className="director-stage__camera-list">{state.composition.cameras.map((camera) => <Button variant="ghost" type="button" key={camera.id} className={state.activeCameraId === camera.id ? "is-active" : ""} onClick={() => { dispatch({ type: "select", selection: { kind: "camera", id: camera.id } }); dispatch({ type: "setViewMode", mode: "camera", cameraId: camera.id }); }}><Camera size={14} />{camera.label}</Button>)}</div></section>
          <SelectionInspector
            composition={state.composition}
            selectedItem={selectedItem}
            onPatchCharacter={(id, patch) => dispatch({ type: "updateCharacter", id, patch })}
            onPatchProp={(id, patch) => dispatch({ type: "updateProp", id, patch })}
            onPatchCamera={(id, patch) => dispatch({ type: "updateCamera", id, patch })}
          />
          <EnvironmentInspector
            environment={state.composition.environment}
            onPatch={(patch) => dispatch({ type: "updateEnvironment", patch })}
          />

          <section>
            <details><summary className="director-stage__panel-title">场景 JSON</summary>
            <textarea value={jsonDraft} spellCheck={false} onChange={(event) => setJsonDraft(event.target.value)} />
            <div className="director-stage__json-actions">
              <Button variant="ghost" type="button" onClick={() => downloadText("director-composition.json", JSON.stringify(state.composition, null, 2))}><Download size={14} />导出</Button>
              <Button variant="ghost" type="button" onClick={importJson}>导入</Button>
              <Button variant="ghost" type="button" onClick={() => setJsonDraft(JSON.stringify(state.composition, null, 2))}>当前</Button>
            </div>
            <p className="director-stage__hint" role="status">{jsonMessage}</p></details>
          </section>
          {shots.length > 0 && <section><div className="director-stage__panel-title">镜头记录</div><div className="director-stage__shots">{shots.map((shot, index) => <a key={index} href={shot.url} download={`shot-${index + 1}.png`}><img src={shot.url} alt={shot.label} /><span>{shot.label}</span></a>)}</div></section>}
        </aside>
      </div>
    </div>
  );
}
