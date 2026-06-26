import type React from "react";
import { Box, Camera, Maximize, MousePointer2, Move, RotateCw, Trash2, Upload, UserPlus } from "lucide-react";
import { IconButton, ToolMenuItem, ToolMenuPanel, ToolSlot } from "./DirectorStage.controls";
import { CAMERA_PRESETS, FURNITURE_PROPS, GEOMETRY_PROPS } from "./DirectorStage.menuData";
import { ASPECT_RATIOS, type AspectRatio } from "./DirectorStage.utils";
import type { ToolMenu } from "./DirectorStage.sceneTypes";
import type { DirectorCamera, DirectorPropType, DirectorTransformMode, DirectorViewMode } from "./DirectorStage.types";

export function ViewportToolbar({
  transformMode,
  viewMode,
  onRemoveSelected,
  onSetTransformMode,
  onSetViewMode,
}: {
  transformMode: DirectorTransformMode;
  viewMode: DirectorViewMode;
  onRemoveSelected: () => void;
  onSetTransformMode: (mode: DirectorTransformMode) => void;
  onSetViewMode: (mode: DirectorViewMode) => void;
}) {
  return (
    <div className="director-stage__viewport-toolbar" aria-label="导演台工具栏">
      <div className="director-stage__segmented">
        {([
          ["director", "导演视角"],
          ["camera", "机位视角"],
        ] as Array<[DirectorViewMode, string]>).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            className={viewMode === mode ? "is-active" : ""}
            onClick={() => onSetViewMode(mode)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="director-stage__tools">
        {([
          ["translate", <Move size={17} />, "移动"],
          ["rotate", <RotateCw size={17} />, "旋转"],
          ["scale", <Maximize size={17} />, "缩放"],
        ] as Array<[DirectorTransformMode, React.ReactNode, string]>).map(([mode, icon, label]) => (
          <IconButton
            key={mode}
            label={label}
            active={transformMode === mode}
            onClick={() => onSetTransformMode(mode)}
          >
            {icon}
          </IconButton>
        ))}
        <IconButton label="删除选中" onClick={onRemoveSelected}>
          <Trash2 size={17} />
        </IconButton>
      </div>
    </div>
  );
}

export function BottomTools({
  aspectRatio,
  isFullscreen,
  openMenu,
  transformMode,
  onAddCamera,
  onAddCharacter,
  onAddCrowd,
  onAddProp,
  onApplyCurrentViewCamera,
  onClickUpload,
  onSetAspectRatio,
  onSetMode,
  onSetOpenMenu,
  onToggleFullscreen,
}: {
  aspectRatio: AspectRatio;
  isFullscreen: boolean;
  openMenu: ToolMenu;
  transformMode: DirectorTransformMode;
  onAddCamera: (camera?: Partial<DirectorCamera>) => void;
  onAddCharacter: (bodyType: "mannequin" | "female" | "child", label: string) => void;
  onAddCrowd: () => void;
  onAddProp: (propType: DirectorPropType, label?: string) => void;
  onApplyCurrentViewCamera: () => void;
  onClickUpload: () => void;
  onSetAspectRatio: (ratio: AspectRatio) => void;
  onSetMode: (mode: DirectorTransformMode) => void;
  onSetOpenMenu: (menu: ToolMenu) => void;
  onToggleFullscreen: () => void;
}) {
  return (
    <div className="director-stage__bottom-tools" aria-label="对象工具栏">
      <ToolSlot active={openMenu === "mode"} menu={openMenu === "mode" ? (
        <ToolMenuPanel>
          <ToolMenuItem mark={<MousePointer2 size={17} />} shortcut="V" active={transformMode === "translate"} onClick={() => onSetMode("translate")}>移动</ToolMenuItem>
          <ToolMenuItem mark={<RotateCw size={17} />} shortcut="R" active={transformMode === "rotate"} onClick={() => onSetMode("rotate")}>旋转</ToolMenuItem>
          <ToolMenuItem mark="↙" shortcut="S" active={transformMode === "scale"} onClick={() => onSetMode("scale")}>缩放</ToolMenuItem>
        </ToolMenuPanel>
      ) : null}>
        <IconButton label="选择和变换" active={openMenu === "mode"} onClick={() => onSetOpenMenu(openMenu === "mode" ? null : "mode")}>
          <MousePointer2 size={18} />
        </IconButton>
      </ToolSlot>

      <ToolSlot active={openMenu === "character"} menu={openMenu === "character" ? (
        <ToolMenuPanel>
          <ToolMenuItem mark={<Upload size={16} />} onClick={onClickUpload}>本地上传</ToolMenuItem>
          <div className="director-stage__tool-menu-separator" />
          <ToolMenuItem mark="♙" onClick={() => onAddCharacter("mannequin", "男性素体")}>男性素体</ToolMenuItem>
          <ToolMenuItem mark="♙" onClick={() => onAddCharacter("female", "女性素体")}>女性素体</ToolMenuItem>
          <ToolMenuItem mark="♙" onClick={() => onAddCharacter("child", "儿童素体")}>儿童素体</ToolMenuItem>
          <ToolMenuItem mark="♙" onClick={onAddCrowd}>群众 (3x3)</ToolMenuItem>
        </ToolMenuPanel>
      ) : null}>
        <IconButton label="添加角色" active={openMenu === "character"} onClick={() => onSetOpenMenu(openMenu === "character" ? null : "character")}>
          <UserPlus size={18} />
        </IconButton>
      </ToolSlot>

      <ToolSlot active={openMenu === "prop"} menu={openMenu === "prop" ? (
        <ToolMenuPanel>
          <div className="director-stage__tool-menu-heading">几何</div>
          {GEOMETRY_PROPS.map((item) => (
            <ToolMenuItem key={`${item.type}-${item.label}`} mark={item.mark} onClick={() => onAddProp(item.type, item.label)}>
              {item.label}
            </ToolMenuItem>
          ))}
          <div className="director-stage__tool-menu-separator" />
          <div className="director-stage__tool-menu-heading">家具</div>
          {FURNITURE_PROPS.map((item) => (
            <ToolMenuItem key={item.type} mark={item.mark} onClick={() => onAddProp(item.type, item.label)}>
              {item.label}
            </ToolMenuItem>
          ))}
        </ToolMenuPanel>
      ) : null}>
        <IconButton label="添加道具" active={openMenu === "prop"} onClick={() => onSetOpenMenu(openMenu === "prop" ? null : "prop")}>
          <Box size={18} />
        </IconButton>
      </ToolSlot>

      <ToolSlot active={openMenu === "camera"} menu={openMenu === "camera" ? (
        <ToolMenuPanel>
          <div className="director-stage__tool-menu-heading">添加机位</div>
          <ToolMenuItem mark={<Camera size={16} />} onClick={onApplyCurrentViewCamera}>应用当前视角</ToolMenuItem>
          <div className="director-stage__tool-menu-heading">预设视角</div>
          {CAMERA_PRESETS.map((preset) => (
            <ToolMenuItem key={preset.label} mark="" onClick={() => onAddCamera({ ...preset.camera, label: preset.label })}>
              {preset.label}
            </ToolMenuItem>
          ))}
        </ToolMenuPanel>
      ) : null}>
        <IconButton label="添加机位" active={openMenu === "camera"} onClick={() => onSetOpenMenu(openMenu === "camera" ? null : "camera")}>
          <Camera size={18} />
        </IconButton>
      </ToolSlot>

      <ToolSlot active={openMenu === "aspect"} menu={openMenu === "aspect" ? (
        <ToolMenuPanel wide>
          <div className="director-stage__aspect-title">比例</div>
          <div className="director-stage__aspect-grid">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio}
                type="button"
                className={aspectRatio === ratio ? "director-stage__aspect-option is-active" : "director-stage__aspect-option"}
                onClick={() => {
                  onSetAspectRatio(ratio);
                  onSetOpenMenu(null);
                }}
              >
                <span className={`director-stage__aspect-icon is-${ratio.replace(":", "-").toLowerCase()}`} />
                <span>{ratio}</span>
              </button>
            ))}
          </div>
        </ToolMenuPanel>
      ) : null}>
        <IconButton label="比例" active={openMenu === "aspect"} onClick={() => onSetOpenMenu(openMenu === "aspect" ? null : "aspect")}>
          <Maximize size={18} />
        </IconButton>
      </ToolSlot>

      <ToolSlot>
        <IconButton label={isFullscreen ? "退出全屏" : "进入全屏"} active={isFullscreen} onClick={onToggleFullscreen}>
          <span className="director-stage__fullscreen-glyph">{isFullscreen ? "⌜⌟" : "⌞⌝"}</span>
        </IconButton>
      </ToolSlot>
    </div>
  );
}
