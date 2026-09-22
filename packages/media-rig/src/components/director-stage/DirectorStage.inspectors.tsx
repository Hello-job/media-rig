import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../motion/select";
import { Input } from "../motion/input";
import { Switch } from "../motion/switch";
import { Button } from "../motion/button/base";
import { useState } from "react";
import CameraMonitor from "./CameraMonitor";
import { Field, JointSlider, VectorEditor } from "./DirectorStage.controls";
import { BODY_TYPE_OPTIONS, CHARACTER_MODELS, DIRECTOR_COLORS, POSE_PRESETS, PROP_OPTIONS } from "./DirectorStage.constants";
import type { SceneItem } from "./DirectorStage.sceneTypes";
import type {
  DirectorCamera,
  DirectorCharacter,
  DirectorComposition,
  DirectorEnvironment,
  DirectorProp,
  DirectorPropType,
  JointAngles,
} from "./DirectorStage.types";

function CharacterInspector({
  character,
  onPatch,
}: {
  character: DirectorCharacter;
  onPatch: (patch: Partial<DirectorCharacter>) => void;
}) {
  const [tab, setTab] = useState<"properties" | "pose" | "action">("properties");
  const updateJoint = <Group extends keyof JointAngles, Key extends keyof JointAngles[Group]>(
    group: Group,
    key: Key,
    value: number,
  ) => {
    onPatch({
      jointAngles: {
        ...character.jointAngles,
        [group]: { ...character.jointAngles[group], [key]: value },
      },
    });
  };

  return (
    <>
      <div className="director-stage__inspector-tabs" aria-label="角色检查器">
        {([['properties', '属性'], ['pose', '姿势'], ['action', '动作']] as const).map(([value, label]) => <Button variant="ghost" type="button" key={value} aria-pressed={tab === value} onClick={() => setTab(value)}>{label}</Button>)}
      </div>
      {tab === "properties" && <>
      <Field label="名称">
        <Input aria-label="名称" value={character.label} onChange={label => onPatch({ label })} classNames={{ field: "h-8", input: "text-xs" }} />
      </Field>
      <Field label="模型"><Select value={CHARACTER_MODELS.some((model) => model.url === character.modelUrl) ? character.modelUrl : "custom"} onValueChange={(value) => onPatch({ modelUrl: value, animationMode: "static" })}><SelectTrigger aria-label="角色模型" className="min-h-8 py-1 text-xs"><SelectValue /></SelectTrigger><SelectContent>{CHARACTER_MODELS.map((model) => <SelectItem key={model.label} value={model.url}>{model.label}</SelectItem>)}<SelectItem value="custom" disabled>导入模型</SelectItem></SelectContent></Select></Field>
      <Field label="体型">
        <Select value={character.bodyType} onValueChange={(value) => onPatch({ bodyType: value as DirectorCharacter["bodyType"] })}><SelectTrigger aria-label="体型" className="min-h-8 py-1 text-xs"><SelectValue /></SelectTrigger><SelectContent>
          {BODY_TYPE_OPTIONS.map(({ type, label }) => <SelectItem key={type} value={type}>{label}</SelectItem>)}
          <SelectItem value="custom">自定义模型</SelectItem>
        </SelectContent></Select>
      </Field>
      <div className="director-stage__swatches" aria-label="角色颜色">
        {DIRECTOR_COLORS.map((color) => (
          <Button variant="ghost"
            key={color}
            type="button"
            className={character.color === color ? "is-active" : ""}
            style={{ backgroundColor: color }}
            aria-label={`颜色 ${color}`}
            onClick={() => onPatch({ color })}
          />
        ))}
      </div>
      <VectorEditor label="位置" value={character.position} onChange={(position) => onPatch({ position })} />
      <VectorEditor label="旋转" value={character.rotation} onChange={(rotation) => onPatch({ rotation })} step={1} />
      <VectorEditor label="缩放" value={character.scale} onChange={(scale) => onPatch({ scale })} />
      </>}
      {tab === "pose" && <>
      <div className="director-stage__section-title">姿态</div>
      <div className="director-stage__pose-grid">
        {POSE_PRESETS.map((pose) => (
          <Button variant="ghost" key={pose.id} type="button" onClick={() => onPatch({ jointAngles: structuredClone(pose.joints), animationMode: "static" })}>
            {pose.label}
          </Button>
        ))}
      </div>
      <JointSlider label="头部点头" min={-35} max={35} value={character.jointAngles.head.nod} onChange={(value) => updateJoint("head", "nod", value)} />
      <JointSlider label="头部转向" min={-60} max={60} value={character.jointAngles.head.turn} onChange={(value) => updateJoint("head", "turn", value)} />
      <JointSlider label="躯干前后" min={-35} max={35} value={character.jointAngles.torso.bend} onChange={(value) => updateJoint("torso", "bend", value)} />
      <JointSlider label="躯干转向" min={-35} max={35} value={character.jointAngles.torso.turn} onChange={(value) => updateJoint("torso", "turn", value)} />
      <JointSlider label="左臂抬起" min={-80} max={90} value={character.jointAngles.lArm.raise} onChange={(value) => updateJoint("lArm", "raise", value)} />
      <JointSlider label="右臂抬起" min={-80} max={90} value={character.jointAngles.rArm.raise} onChange={(value) => updateJoint("rArm", "raise", value)} />
      <JointSlider label="左臂展开" min={-90} max={90} value={character.jointAngles.lArm.straddle} onChange={(value) => updateJoint("lArm", "straddle", value)} />
      <JointSlider label="右臂展开" min={-90} max={90} value={character.jointAngles.rArm.straddle} onChange={(value) => updateJoint("rArm", "straddle", value)} />
      <JointSlider label="左臂转向" min={-90} max={90} value={character.jointAngles.lArm.turn} onChange={(value) => updateJoint("lArm", "turn", value)} />
      <JointSlider label="右臂转向" min={-90} max={90} value={character.jointAngles.rArm.turn} onChange={(value) => updateJoint("rArm", "turn", value)} />
      <JointSlider label="左肘弯曲" min={0} max={120} value={character.jointAngles.lElbow.bend} onChange={(value) => updateJoint("lElbow", "bend", value)} />
      <JointSlider label="右肘弯曲" min={0} max={120} value={character.jointAngles.rElbow.bend} onChange={(value) => updateJoint("rElbow", "bend", value)} />
      <JointSlider label="左腿抬起" min={-70} max={80} value={character.jointAngles.lLeg.raise} onChange={(value) => updateJoint("lLeg", "raise", value)} />
      <JointSlider label="右腿抬起" min={-70} max={80} value={character.jointAngles.rLeg.raise} onChange={(value) => updateJoint("rLeg", "raise", value)} />
      <JointSlider label="左腿展开" min={-70} max={70} value={character.jointAngles.lLeg.straddle} onChange={(value) => updateJoint("lLeg", "straddle", value)} />
      <JointSlider label="右腿展开" min={-70} max={70} value={character.jointAngles.rLeg.straddle} onChange={(value) => updateJoint("rLeg", "straddle", value)} />
      <JointSlider label="左膝弯曲" min={0} max={95} value={character.jointAngles.lKnee.bend} onChange={(value) => updateJoint("lKnee", "bend", value)} />
      <JointSlider label="右膝弯曲" min={0} max={95} value={character.jointAngles.rKnee.bend} onChange={(value) => updateJoint("rKnee", "bend", value)} />
      </>}
      {tab === "action" && <>      {character.modelUrl ? (
        <Field label="动画">
          <Select
            value={character.animationMode ?? "static"}
            onValueChange={(value) => onPatch({ animationMode: value as DirectorCharacter["animationMode"] })}
          ><SelectTrigger aria-label="动画" className="min-h-8 py-1 text-xs"><SelectValue /></SelectTrigger><SelectContent>
            <SelectItem value="static">静态摆姿</SelectItem>
            <SelectItem value="play">播放动作</SelectItem>
          </SelectContent></Select>
        </Field>
      ) : null}
<p className="director-stage__hint">播放模型自带的第一个动画片段；静态模型请使用姿势面板。</p></>}
    </>
  );
}

function PropInspector({
  prop,
  onPatch,
}: {
  prop: DirectorProp;
  onPatch: (patch: Partial<DirectorProp>) => void;
}) {
  return (
    <>
      <Field label="名称">
        <Input aria-label="名称" value={prop.label} onChange={label => onPatch({ label })} classNames={{ field: "h-8", input: "text-xs" }} />
      </Field>
      <Field label="类型">
        <Select value={prop.propType} onValueChange={(value) => onPatch({ propType: value as DirectorPropType })}><SelectTrigger aria-label="类型" className="min-h-8 py-1 text-xs"><SelectValue /></SelectTrigger><SelectContent>
          {PROP_OPTIONS.map((option) => (
            <SelectItem key={option.type} value={option.type}>{option.label}</SelectItem>
          ))}
        </SelectContent></Select>
      </Field>
      <Field label="颜色">
        <input type="color" value={prop.color} onChange={(event) => onPatch({ color: event.target.value })} />
      </Field>
      <VectorEditor label="位置" value={prop.position} onChange={(position) => onPatch({ position })} />
      <VectorEditor label="旋转" value={prop.rotation} onChange={(rotation) => onPatch({ rotation })} step={1} />
      <VectorEditor label="缩放" value={prop.scale} onChange={(scale) => onPatch({ scale })} />
    </>
  );
}

function CameraInspector({
  camera,
  composition,
  onPatch,
}: {
  camera: DirectorCamera;
  composition: DirectorComposition;
  onPatch: (patch: Partial<DirectorCamera>) => void;
}) {
  return (
    <>
      <Field label="名称">
        <Input aria-label="名称" value={camera.label} onChange={label => onPatch({ label })} classNames={{ field: "h-8", input: "text-xs" }} />
      </Field>
      <VectorEditor label="位置" value={camera.position} onChange={(position) => onPatch({ position })} />
      <Field label="注视目标">
        <Select value="" onValueChange={(value) => {
          const target = [...composition.characters, ...composition.props].find((item) => item.id === value);
          if (target) onPatch({ lookAt: { ...target.position, y: target.position.y + ("bodyType" in target ? 1.2 : 0.5) } });
        }}><SelectTrigger aria-label="对准对象" className="min-h-8 py-1 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="">对准对象…</SelectItem>{[...composition.characters, ...composition.props].map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select>
      </Field>
      <VectorEditor label="注视坐标" value={camera.lookAt} onChange={(lookAt) => onPatch({ lookAt })} />
      <JointSlider label="焦距视角" min={20} max={80} value={camera.fov} onChange={(fov) => onPatch({ fov })} />
    </>
  );
}

export function SelectionInspector({
  composition,
  selectedItem,
  onPatchCharacter,
  onPatchProp,
  onPatchCamera,
}: {
  composition: DirectorComposition;
  selectedItem: SceneItem | null;
  onPatchCharacter: (id: string, patch: Partial<DirectorCharacter>) => void;
  onPatchProp: (id: string, patch: Partial<DirectorProp>) => void;
  onPatchCamera: (id: string, patch: Partial<DirectorCamera>) => void;
}) {
  return (
    <section>
      <div className="director-stage__panel-title">{selectedItem?.kind === "camera" ? "机位" : "检查器"}</div>
      {selectedItem?.kind === "character" ? (
        <CharacterInspector
          character={selectedItem.item}
          onPatch={(patch) => onPatchCharacter(selectedItem.item.id, patch)}
        />
      ) : null}
      {selectedItem?.kind === "prop" ? (
        <PropInspector
          prop={selectedItem.item}
          onPatch={(patch) => onPatchProp(selectedItem.item.id, patch)}
        />
      ) : null}
      {selectedItem?.kind === "camera" ? (
        <>
          <CameraMonitor camera={selectedItem.item} composition={composition} />
          <CameraInspector
            camera={selectedItem.item}
            composition={composition}
            onPatch={(patch) => onPatchCamera(selectedItem.item.id, patch)}
          />
        </>
      ) : null}
      {!selectedItem ? <p className="director-stage__empty">选择画布中的对象或层级节点。</p> : null}
    </section>
  );
}

export function EnvironmentInspector({
  environment,
  onPatch,
}: {
  environment: DirectorEnvironment;
  onPatch: (patch: Partial<DirectorEnvironment>) => void;
}) {
  return (
    <section>
      <div className="director-stage__panel-title">环境</div>
      <Field label="地面">
        <Switch
          ariaLabel="地面"
          checked={environment.showGround}
          onCheckedChange={showGround => onPatch({ showGround })}
        />
      </Field>
      <JointSlider
        label="地面透明"
        min={0}
        max={1}
        step={0.01}
        value={environment.groundOpacity}
        onChange={(groundOpacity) => onPatch({ groundOpacity })}
      />
      <Field label="天空色">
        <input
          type="color"
          value={environment.skyColor}
          onChange={(event) => onPatch({ skyColor: event.target.value })}
        />
      </Field>
    </section>
  );
}
