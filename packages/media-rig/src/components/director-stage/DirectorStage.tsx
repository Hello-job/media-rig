import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Camera, Download, Search, Upload, UserPlus } from "lucide-react";
import DirectorStageCanvas from "./DirectorStageCanvas";
import { DEFAULT_CHARACTER_MODEL_URL, DEFAULT_COMPOSITION, PROP_OPTIONS, RELAXED_STAND_JOINTS } from "./DirectorStage.constants";
import { EnvironmentInspector, SelectionInspector } from "./DirectorStage.inspectors";
import type { SceneItem, ToolMenu } from "./DirectorStage.sceneTypes";
import { BottomTools, ViewportToolbar } from "./DirectorStage.toolbars";
import { downloadText, ratioToNumber, type AspectRatio } from "./DirectorStage.utils";
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

const SAMPLE_SEED: ParsedSceneSeed = {
  characters: [
    {
      label: "CharacterA",
      bodyType: "custom",
      modelUrl: DEFAULT_CHARACTER_MODEL_URL,
      animationMode: "static",
      color: "#4f8ef7",
      position: { x: -1, y: 0, z: -0.25 },
      rotation: { x: 0, y: 18, z: 0 },
      jointAngles: RELAXED_STAND_JOINTS,
    },
  ],
  props: [
    { label: "圆桌1", propType: "roundTable", position: { x: -0.15, y: 0, z: -0.15 } },
    { label: "轿车2", propType: "car", position: { x: 0.6, y: 0, z: -1.25 }, rotation: { x: 0, y: -12, z: 0 } },
  ],
  cameras: [
    {
      label: "Camera1",
      position: { x: 2.068, y: 2.865, z: 5.781 },
      lookAt: { x: 0, y: 1.2, z: 0 },
      fov: 50,
    },
  ],
  environment: {
    showGround: true,
    groundOpacity: 0.3,
    skyColor: "#161616",
  },
};

export default function DirectorStage({
  className,
  style,
  initialComposition,
  storageKey = "media-rig-director-stage-dark-v2",
  onCompositionChange,
  onCapture,
}: DirectorStageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, dispatch } = useDirectorStage(initialComposition, storageKey);
  const [propType, setPropType] = useState<DirectorPropType>("cube");
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
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key.toLowerCase() === "v") dispatch({ type: "setTransformMode", mode: "translate" });
      if (event.key.toLowerCase() === "r") dispatch({ type: "setTransformMode", mode: "rotate" });
      if (event.key.toLowerCase() === "s") dispatch({ type: "setTransformMode", mode: "scale" });
      if (event.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);

  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

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

  const captureCanvas = () => {
    const canvas = rootRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onCapture?.(dataUrl);
    const anchor = document.createElement("a");
    anchor.download = "director-stage.png";
    anchor.href = dataUrl;
    anchor.click();
  };

  const importJson = () => {
    try {
      dispatch({ type: "importSeed", seed: JSON.parse(jsonDraft) as ParsedSceneSeed });
      setJsonMessage("已导入场景 seed");
    } catch {
      setJsonMessage("JSON 格式不正确");
    }
  };

  const addUploadedModel = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
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
    setPropType(nextPropType);
    setOpenMenu(null);
  };

  const addCamera = (camera?: Partial<DirectorCamera>) => {
    dispatch({ type: "addCamera", camera });
    setOpenMenu(null);
  };

  const applyCurrentViewCamera = () => {
    if (selectedItem?.kind === "camera") {
      addCamera({
        label: `${selectedItem.item.label} Copy`,
        position: selectedItem.item.position,
        lookAt: selectedItem.item.lookAt,
        fov: selectedItem.item.fov,
      });
      return;
    }
    addCamera();
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
    <div className={stageClassName} style={style} ref={rootRef}>
      <header className="director-stage__topbar">
        <div className="director-stage__brand">
          <span className="director-stage__brand-mark">♟</span>
          <h1>3D 导演台</h1>
        </div>
        <div className="director-stage__top-actions">
          <button type="button" title="导出 JSON" aria-label="导出 JSON" onClick={() => downloadText("director-composition.json", JSON.stringify(state.composition, null, 2))}><Download size={16} /></button>
          <button type="button" title="截图" aria-label="截图" onClick={captureCanvas}><Camera size={16} /></button>
          <span className="director-stage__app-dots" aria-hidden="true">⋮⋮⋮</span>
        </div>
      </header>

      <div className="director-stage__body">
        <aside className="director-stage__rail" aria-label="素材和层级">
          <section>
            <div className="director-stage__panel-title">场景</div>
            <label className="director-stage__search">
              <Search size={16} />
              <input placeholder="请输入搜索内容" />
            </label>
            <div className="director-stage__asset-grid">
              <button type="button" onClick={() => dispatch({ type: "addCharacter" })}>
                <UserPlus size={18} />
                <span>角色</span>
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()}>
                <Upload size={18} />
                <span>GLB</span>
              </button>
              <button type="button" onClick={() => dispatch({ type: "addCamera" })}>
                <Camera size={18} />
                <span>机位</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
              hidden
              onChange={(event) => addUploadedModel(event.target.files?.[0])}
            />
            <div className="director-stage__prop-add">
              <select value={propType} onChange={(event) => setPropType(event.target.value as DirectorPropType)}>
                {PROP_OPTIONS.map((option) => (
                  <option key={option.type} value={option.type}>{option.label}</option>
                ))}
              </select>
              <button type="button" onClick={() => dispatch({ type: "addProp", propType })}>
                <Box size={16} />加入
              </button>
            </div>
          </section>

          <section>
            <div className="director-stage__panel-title">层级</div>
            <SceneTree
              composition={state.composition}
              selection={state.selection}
              onSelect={(selection) => dispatch({ type: "select", selection })}
              onDuplicate={(selection) => dispatch({ type: "duplicateItem", selection })}
              onRemove={(selection) => dispatch({ type: "removeItem", selection })}
              onToggleLocked={(selection, locked) => dispatch({ type: "setItemLocked", selection, locked })}
              onToggleVisible={(selection, visible) => dispatch({ type: "setItemVisible", selection, visible })}
            />
          </section>
        </aside>

        <main className="director-stage__viewport">
          <ViewportToolbar
            transformMode={state.transformMode}
            viewMode={state.viewMode}
            onRemoveSelected={() => dispatch({ type: "removeSelected" })}
            onSetTransformMode={(mode) => dispatch({ type: "setTransformMode", mode })}
            onSetViewMode={(mode) => dispatch({ type: "setViewMode", mode })}
          />

          <DirectorStageCanvas
            composition={state.composition}
            selection={state.selection}
            transformMode={state.transformMode}
            viewMode={state.viewMode}
            activeCameraId={state.activeCameraId}
            onSelect={(selection) => dispatch({ type: "select", selection })}
            onTransform={(transform) => dispatch({ type: "transformSelected", transform })}
          />

          {aspectNumber ? (
            <div className="director-stage__aspect-frame" style={{ aspectRatio: aspectNumber }} aria-hidden="true" />
          ) : null}

          <BottomTools
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

        <aside className="director-stage__inspector" aria-label="属性检查器">
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
            <div className="director-stage__panel-title">场景 Seed</div>
            <textarea value={jsonDraft} spellCheck={false} onChange={(event) => setJsonDraft(event.target.value)} />
            <div className="director-stage__json-actions">
              <button type="button" onClick={importJson}>导入</button>
              <button type="button" onClick={() => setJsonDraft(JSON.stringify(DEFAULT_COMPOSITION, null, 2))}>当前</button>
            </div>
            <p className="director-stage__hint">{jsonMessage}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
