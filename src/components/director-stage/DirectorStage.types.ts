import type { CSSProperties } from "react";

export type Vector3Like = {
  x: number;
  y: number;
  z: number;
};

export type DirectorBodyType = "mannequin" | "female" | "child" | "custom";

export type DirectorPropType =
  | "cube"
  | "sphere"
  | "cylinder"
  | "cone"
  | "torus"
  | "chair"
  | "sofa"
  | "table"
  | "roundTable"
  | "bed"
  | "car"
  | "column";

export type DirectorTransformMode = "translate" | "rotate" | "scale";

export type DirectorViewMode = "director" | "camera" | "front" | "top";

export type JointAngles = {
  head: { nod: number; turn: number };
  torso: { bend: number; turn: number };
  lArm: { raise: number; straddle: number; turn: number };
  rArm: { raise: number; straddle: number; turn: number };
  lElbow: { bend: number };
  rElbow: { bend: number };
  lLeg: { raise: number; straddle: number };
  rLeg: { raise: number; straddle: number };
  lKnee: { bend: number };
  rKnee: { bend: number };
};

export type DirectorTransform = {
  position: Vector3Like;
  rotation: Vector3Like;
  scale: Vector3Like;
};

export type DirectorCharacter = DirectorTransform & {
  id: string;
  label: string;
  bodyType: DirectorBodyType;
  color: string;
  modelUrl?: string;
  animationMode?: "static" | "play";
  jointAngles: JointAngles;
  visible: boolean;
  locked: boolean;
};

export type DirectorProp = DirectorTransform & {
  id: string;
  label: string;
  propType: DirectorPropType;
  color: string;
  visible: boolean;
  locked: boolean;
};

export type DirectorCamera = {
  id: string;
  label: string;
  position: Vector3Like;
  lookAt: Vector3Like;
  fov: number;
  visible: boolean;
  locked: boolean;
};

export type DirectorEnvironment = {
  showGround: boolean;
  groundOpacity: number;
  skyColor: string;
};

export type DirectorComposition = {
  characters: DirectorCharacter[];
  props: DirectorProp[];
  cameras: DirectorCamera[];
  environment: DirectorEnvironment;
};

export type DirectorStageProps = {
  className?: string;
  style?: CSSProperties;
  initialComposition?: Partial<DirectorComposition>;
  storageKey?: string | false;
  onCompositionChange?: (composition: DirectorComposition) => void;
  onCapture?: (dataUrl: string) => void;
};

export type DirectorSelection =
  | { kind: "character"; id: string }
  | { kind: "prop"; id: string }
  | { kind: "camera"; id: string }
  | null;

export type ParsedSceneSeed = {
  characters?: Array<Partial<DirectorCharacter>>;
  props?: Array<Partial<DirectorProp>>;
  cameras?: Array<Partial<DirectorCamera>>;
  environment?: Partial<DirectorEnvironment>;
};
