import type {
  DirectorCamera,
  DirectorCharacter,
  DirectorComposition,
  DirectorEnvironment,
  DirectorProp,
  DirectorPropType,
  JointAngles,
} from "./DirectorStage.types";
import defaultCharacterModelUrl from "./assets/static-mixamo-rigged.glb?url";

export const DEFAULT_CHARACTER_MODEL_URL = defaultCharacterModelUrl;

export const DIRECTOR_COLORS = [
  "#4f8ef7",
  "#f75353",
  "#34c759",
  "#ff9f0a",
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
  groundOpacity: 0.3,
  skyColor: "#161616",
};

export const defaultCharacter = (index: number): DirectorCharacter => ({
  id: `character-${crypto.randomUUID()}`,
  label: index === 0 ? "CharacterA" : `Character${String.fromCharCode(65 + index)}`,
  bodyType: index === 0 ? "custom" : "mannequin",
  modelUrl: index === 0 ? DEFAULT_CHARACTER_MODEL_URL : undefined,
  animationMode: "static",
  color: DIRECTOR_COLORS[index % DIRECTOR_COLORS.length],
  position: { x: -1.0 + index * 0.9, y: 0, z: -0.25 },
  rotation: { x: 0, y: 18, z: 0 },
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
  label: index === 0 ? "Camera1" : `Camera${index + 1}`,
  position: { x: index % 2 === 0 ? 2.068 : 3.2, y: 2.865, z: 5.781 - index * 0.8 },
  lookAt: { x: 0, y: 1.2, z: 0 },
  fov: 50,
  visible: true,
  locked: false,
});

export const DEFAULT_COMPOSITION: DirectorComposition = {
  characters: [defaultCharacter(0)],
  props: [defaultProp(0, "roundTable"), defaultProp(1, "car")],
  cameras: [defaultCamera(0)],
  environment: DEFAULT_ENVIRONMENT,
};
