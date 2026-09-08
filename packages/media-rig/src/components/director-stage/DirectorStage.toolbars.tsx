import { Armchair, Box, Camera, Circle, Cylinder, LampFloor, Move3d, Package, Ratio, Rotate3d, Route, Scaling, Shapes, Sofa, Table2, Upload, UserRound, UserRoundPlus, UsersRound, Video } from "lucide-react";
import { IconButton, ToolMenuItem, ToolMenuPanel, ToolSlot } from "./DirectorStage.controls";
import { BODY_TYPE_OPTIONS } from "./DirectorStage.constants";
import { CAMERA_PRESETS } from "./DirectorStage.menuData";
import { ASPECT_RATIOS, type AspectRatio } from "./DirectorStage.utils";
import type { ToolMenu } from "./DirectorStage.sceneTypes";
import type { DirectorBodyType, DirectorCamera, DirectorPropType, DirectorTransformMode, DirectorViewMode } from "./DirectorStage.types";

export function ViewportToolbar({ viewMode, onSetViewMode }: {
  transformMode: DirectorTransformMode;
  viewMode: DirectorViewMode;
  onRemoveSelected: () => void;
  onSetTransformMode: (mode: DirectorTransformMode) => void;
  onSetViewMode: (mode: DirectorViewMode) => void;
}) {
  return <div className="director-stage__viewport-toolbar" aria-label="导演台视角"><div className="director-stage__segmented">{([['director', '导演视角'], ['camera', '机位视角']] as const).map(([mode, label]) => <button type="button" key={mode} aria-pressed={viewMode === mode} className={viewMode === mode ? "is-active" : ""} onClick={() => onSetViewMode(mode)}>{label}</button>)}</div></div>;
}

const MODES = [
  { mode: 'translate', label: '移动', key: 'V', Icon: Move3d },
  { mode: 'rotate', label: '旋转', key: 'R', Icon: Rotate3d },
  { mode: 'scale', label: '缩放', key: 'F', Icon: Scaling },
] as const;
const PROPS = [
  { type: 'cube', label: '立方体', Icon: Box }, { type: 'sphere', label: '球体', Icon: Circle },
  { type: 'cylinder', label: '圆柱体', Icon: Cylinder }, { type: 'chair', label: '椅子', Icon: Armchair },
  { type: 'table', label: '桌子', Icon: Table2 }, { type: 'sofa', label: '沙发', Icon: Sofa },
  { type: 'crate', label: '木箱', Icon: Package }, { type: 'floor-lamp', label: '落地灯', Icon: LampFloor },
] as const;

type Props = {
  aspectRatio: AspectRatio; isFullscreen: boolean; openMenu: ToolMenu; transformMode: DirectorTransformMode;
  timelineOpen: boolean; onToggleTimeline: () => void; onCapture: () => void;
  onAddCamera: (camera?: Partial<DirectorCamera>) => void;
  onAddCharacter: (bodyType: DirectorBodyType, label?: string) => void;
  onAddCrowd: () => void; onAddProp: (type: DirectorPropType, label?: string) => void;
  onApplyCurrentViewCamera: () => void; onClickUpload: () => void; onSetAspectRatio: (ratio: AspectRatio) => void;
  onSetMode: (mode: DirectorTransformMode) => void; onSetOpenMenu: (menu: ToolMenu) => void; onToggleFullscreen: () => void;
};

export function BottomTools(props: Props) {
  const { openMenu, onSetOpenMenu } = props;
  const active = MODES.find((item) => item.mode === props.transformMode)!;
  const toggle = (menu: ToolMenu) => onSetOpenMenu(openMenu === menu ? null : menu);
  return <div className="director-stage__bottom-tools" aria-label="对象工具栏">
    <ToolSlot active={openMenu === 'mode'} menu={openMenu === 'mode' && <ToolMenuPanel>{MODES.map(({ mode, label, key, Icon }) => <ToolMenuItem key={mode} active={mode === props.transformMode} mark={<Icon size={18} />} shortcut={key} onClick={() => props.onSetMode(mode)}>{label}</ToolMenuItem>)}</ToolMenuPanel>}><IconButton label={`变换工具：${active.label}`} active={openMenu === 'mode'} onClick={() => toggle('mode')}><active.Icon size={18} /></IconButton></ToolSlot>
    <span className="director-stage__toolbar-separator" />
    <ToolSlot active={openMenu === 'character'} menu={openMenu === 'character' && <ToolMenuPanel>{BODY_TYPE_OPTIONS.map(({ type, label }) => <ToolMenuItem key={type} mark={<UserRound size={16} />} onClick={() => props.onAddCharacter(type, label)}>{label}</ToolMenuItem>)}<ToolMenuItem mark={<UsersRound size={16} />} onClick={props.onAddCrowd}>群众 (3×3)</ToolMenuItem><div className="director-stage__tool-menu-separator" /><ToolMenuItem mark={<Upload size={16} />} onClick={props.onClickUpload}>本地上传 GLB</ToolMenuItem></ToolMenuPanel>}><IconButton label="添加角色" active={openMenu === 'character'} onClick={() => toggle('character')}><UserRoundPlus size={18} /></IconButton></ToolSlot>
    <ToolSlot active={openMenu === 'camera'} menu={openMenu === 'camera' && <ToolMenuPanel><ToolMenuItem mark={<Video size={16} />} onClick={props.onApplyCurrentViewCamera}>当前视角</ToolMenuItem>{CAMERA_PRESETS.map((preset) => <ToolMenuItem key={preset.label} mark={<Video size={16} />} onClick={() => props.onAddCamera({ ...preset.camera, label: preset.label })}>{preset.label}</ToolMenuItem>)}</ToolMenuPanel>}><IconButton label="添加机位" active={openMenu === 'camera'} onClick={() => toggle('camera')}><Video size={18} /></IconButton></ToolSlot>
    <ToolSlot active={openMenu === 'prop'} menu={openMenu === 'prop' && <ToolMenuPanel>{PROPS.map(({ type, label, Icon }) => <ToolMenuItem key={type} mark={<Icon size={16} />} onClick={() => props.onAddProp(type, label)}>{label}</ToolMenuItem>)}</ToolMenuPanel>}><IconButton label="添加道具" active={openMenu === 'prop'} onClick={() => toggle('prop')}><Shapes size={18} /></IconButton></ToolSlot>
    <span className="director-stage__toolbar-separator" />
    <IconButton label="运镜时间线" active={props.timelineOpen} onClick={props.onToggleTimeline}><Route size={18} /></IconButton>
    <ToolSlot active={openMenu === 'aspect'} menu={openMenu === 'aspect' && <ToolMenuPanel wide><div className="director-stage__aspect-title">比例</div><div className="director-stage__aspect-grid">{ASPECT_RATIOS.map((ratio) => <button type="button" key={ratio} aria-label={`设置画面比例为 ${ratio}`} className={props.aspectRatio === ratio ? 'director-stage__aspect-option is-active' : 'director-stage__aspect-option'} onClick={() => { props.onSetAspectRatio(ratio); onSetOpenMenu(null); }}><span className={`director-stage__aspect-icon is-${ratio.replace(':', '-').toLowerCase()}`} /><span>{ratio}</span></button>)}</div></ToolMenuPanel>}><IconButton label={`画面比例：${props.aspectRatio}`} active={openMenu === 'aspect'} onClick={() => toggle('aspect')}><Ratio size={18} /></IconButton></ToolSlot>
    <IconButton label="保存当前机位截图" onClick={props.onCapture}><Camera size={18} /></IconButton>
  </div>;
}
