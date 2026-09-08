import type {
  DirectorCamera,
  DirectorCharacter,
  DirectorComposition,
  DirectorEnvironment,
  DirectorProp,
  DirectorPropType,
  JointAngles,
} from "./DirectorStage.types";
import defaultCharacterModelUrl from "./assets/ue-mannequin-retopology.glb?url";
import mixamoModelUrl from "./assets/static-mixamo-rigged.glb?url";

export const CHARACTER_MODELS = [
  { label: "UE Mannequin", url: defaultCharacterModelUrl },
  { label: "Mixamo", url: mixamoModelUrl },
];

export const DEFAULT_CHARACTER_MODEL_URL = defaultCharacterModelUrl;

export const DIRECTOR_COLORS = [
  "#4f8ef7",
  "#e0524d",
  "#12b886",
  "#f2a900",
  "#af52de",
  "#ff2d55",
  "#5ac8fa",
  "#ffd60a",
];

export const PROP_OPTIONS: Array<{ type: DirectorPropType; label: string }> = [
  { type: "cube", label: "立方体" },
  { type: "sphere", label: "球体" },
  { type: "cylinder", label: "圆柱" },
  { type: "cone", label: "圆锥" },
  { type: "torus", label: "环形" },
  { type: "chair", label: "椅子" },
  { type: "sofa", label: "沙发" },
  { type: "table", label: "桌子" },
  { type: "roundTable", label: "圆桌" },
  { type: "bed", label: "床" },
  { type: "car", label: "轿车" },
  { type: "column", label: "柱体" },
  { type: "crate", label: "木箱" },
  { type: "floor-lamp", label: "落地灯" },
];

export const DEFAULT_JOINTS: JointAngles = {
  head: { nod: 0, turn: 0 },
  torso: { bend: 0, turn: 0 },
  lArm: { raise: 8, straddle: 22, turn: 0 },
  rArm: { raise: 8, straddle: -22, turn: 0 },
  lElbow: { bend: 12 },
  rElbow: { bend: 12 },
  lLeg: { raise: 0, straddle: 8 },
  rLeg: { raise: 0, straddle: -8 },
  lKnee: { bend: 4 },
  rKnee: { bend: 4 },
};

export const RELAXED_STAND_JOINTS: JointAngles = {
  head: { nod: 0, turn: 0 },
  torso: { bend: 0, turn: 0 },
  lArm: { raise: 0, straddle: -4, turn: 6 },
  rArm: { raise: 0, straddle: 4, turn: -6 },
  lElbow: { bend: 8 },
  rElbow: { bend: 8 },
  lLeg: { raise: 0, straddle: 0 },
  rLeg: { raise: 0, straddle: 0 },
  lKnee: { bend: 2 },
  rKnee: { bend: 2 },
};

export const POSE_PRESETS: Array<{ id: string; label: string; joints: JointAngles }> = [
  { id: "stand", label: "站立", joints: RELAXED_STAND_JOINTS },
  {
    id: "walk",
    label: "行走",
    joints: {
      ...DEFAULT_JOINTS,
      lArm: { raise: -18, straddle: 18, turn: -8 },
      rArm: { raise: 24, straddle: -18, turn: 8 },
      lLeg: { raise: 22, straddle: 6 },
      rLeg: { raise: -18, straddle: -6 },
      rKnee: { bend: 24 },
    },
  },
  {
    id: "hero",
    label: "英雄",
    joints: {
      ...DEFAULT_JOINTS,
      torso: { bend: -4, turn: 6 },
      lArm: { raise: 58, straddle: 34, turn: -10 },
      rArm: { raise: -4, straddle: -30, turn: 12 },
      lElbow: { bend: 36 },
      rElbow: { bend: 18 },
      lLeg: { raise: 6, straddle: 18 },
      rLeg: { raise: -5, straddle: -20 },
    },
  },
  {
    id: "squat",
    label: "下蹲",
    joints: {
      ...DEFAULT_JOINTS,
      torso: { bend: 12, turn: 0 },
      lArm: { raise: 18, straddle: 24, turn: 0 },
      rArm: { raise: 18, straddle: -24, turn: 0 },
      lLeg: { raise: 34, straddle: 16 },
      rLeg: { raise: 34, straddle: -16 },
      lKnee: { bend: 58 },
      rKnee: { bend: 58 },
    },
  },
  {
    id: "tpose",
    label: "T 字",
    joints: {
      ...DEFAULT_JOINTS,
      lArm: { raise: 90, straddle: 0, turn: 0 },
      rArm: { raise: 90, straddle: 0, turn: 0 },
      lElbow: { bend: 0 },
      rElbow: { bend: 0 },
    },
  },
];

export const DEFAULT_ENVIRONMENT: DirectorEnvironment = {
  showGround: true,
  groundOpacity: 1,
  skyColor: "#060608",
};

export const defaultCharacter = (index: number): DirectorCharacter => ({
  id: `character-${crypto.randomUUID()}`,
  label: index === 0 ? "角色A" : `角色${String.fromCharCode(65 + index)}`,
  bodyType: "mannequin",
  modelUrl: DEFAULT_CHARACTER_MODEL_URL,
  animationMode: "static",
  color: DIRECTOR_COLORS[index % DIRECTOR_COLORS.length],
  position: { x: index * 0.9, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  jointAngles: index === 0 ? structuredClone(RELAXED_STAND_JOINTS) : structuredClone(DEFAULT_JOINTS),
  visible: true,
  locked: false,
});

export const defaultProp = (index: number, propType: DirectorPropType = "cube"): DirectorProp => ({
  id: `prop-${crypto.randomUUID()}`,
  label: `${PROP_OPTIONS.find((option) => option.type === propType)?.label ?? "道具"}${index + 1}`,
  propType,
  color: propType === "car" ? "#b93325" : ["#bca586", "#b88a5a", "#7d8797", "#6f7f66"][index % 4],
  position: propType === "car"
    ? { x: 0.6, y: 0, z: -1.25 }
    : { x: -0.15 + index * 0.8, y: 0, z: -0.15 },
  rotation: { x: 0, y: propType === "car" ? -12 : 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
  visible: true,
  locked: false,
});

export const defaultCamera = (index: number): DirectorCamera => ({
  id: `camera-${crypto.randomUUID()}`,
  label: `机位${index + 1}`,
  position: { x: 0, y: 2.7, z: 9 },
  lookAt: { x: 0, y: 1, z: 0 },
  fov: 50,
  visible: true,
  locked: false,
});

export const DEFAULT_COMPOSITION: DirectorComposition = {
  characters: [defaultCharacter(0)],
  props: [],
  cameras: [defaultCamera(0)],
  environment: DEFAULT_ENVIRONMENT,
};

export const BODY_TYPE_OPTIONS = [
  { type: "mannequin", label: "男性素体" }, { type: "female", label: "女性素体" },
  { type: "broad", label: "宽厚素体" }, { type: "muscular", label: "健壮素体" },
  { type: "slim", label: "纤细素体" }, { type: "teen", label: "少年素体" },
  { type: "child", label: "儿童素体" }, { type: "chibi", label: "二头身" },
] as const;
