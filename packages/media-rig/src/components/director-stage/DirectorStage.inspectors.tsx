import CameraMonitor from "./CameraMonitor";
import { Field, JointSlider, VectorEditor } from "./DirectorStage.controls";
import { DIRECTOR_COLORS, POSE_PRESETS, PROP_OPTIONS } from "./DirectorStage.constants";
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
      <Field label="名称">
        <input value={character.label} onChange={(event) => onPatch({ label: event.target.value })} />
      </Field>
      <Field label="体型">
        <select value={character.bodyType} onChange={(event) => onPatch({ bodyType: event.target.value as DirectorCharacter["bodyType"] })}>
          <option value="mannequin">标准</option>
          <option value="female">女性</option>
          <option value="child">儿童</option>
          <option value="custom">自定义模型</option>
        </select>
      </Field>
      {character.modelUrl ? (
        <Field label="动画">
          <select
            value={character.animationMode ?? "static"}
            onChange={(event) => onPatch({ animationMode: event.target.value as DirectorCharacter["animationMode"] })}
          >
            <option value="static">静态摆姿</option>
            <option value="play">播放动作</option>
          </select>
        </Field>
      ) : null}
      <div className="director-stage__swatches" aria-label="角色颜色">
        {DIRECTOR_COLORS.map((color) => (
          <button
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
      <div className="director-stage__section-title">姿态</div>
      <div className="director-stage__pose-grid">
        {POSE_PRESETS.map((pose) => (
          <button key={pose.id} type="button" onClick={() => onPatch({ jointAngles: structuredClone(pose.joints) })}>
            {pose.label}
          </button>
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
        <input value={prop.label} onChange={(event) => onPatch({ label: event.target.value })} />
      </Field>
      <Field label="类型">
        <select value={prop.propType} onChange={(event) => onPatch({ propType: event.target.value as DirectorPropType })}>
          {PROP_OPTIONS.map((option) => (
            <option key={option.type} value={option.type}>{option.label}</option>
          ))}
        </select>
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
  onPatch,
}: {
  camera: DirectorCamera;
  onPatch: (patch: Partial<DirectorCamera>) => void;
}) {
  return (
    <>
      <Field label="名称">
        <input value={camera.label} onChange={(event) => onPatch({ label: event.target.value })} />
      </Field>
      <VectorEditor label="位置" value={camera.position} onChange={(position) => onPatch({ position })} />
      <Field label="注视目标">
        <button type="button" className="director-stage__select-like">
          自由（手动坐标）
          <span>›</span>
        </button>
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
        <input
          type="checkbox"
          checked={environment.showGround}
          onChange={(event) => onPatch({ showGround: event.target.checked })}
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
