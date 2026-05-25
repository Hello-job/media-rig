import type { CSSProperties, MutableRefObject } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import type * as THREE from "three";

export type Vector3Like = {
  x: number;
  y: number;
  z: number;
};

export type LightSphereConfig = {
  color: string;
  spread: number;
  intensity: number;
  glowRadius: number;
  glowIntensity: number;
  baseLineOpacity: number;
  sphereRadius: number;
};

export type LightSphereViewMode = "front" | "perspective";

export type LightSphereProps = Partial<LightSphereConfig> & {
  imageUrl?: string;
  viewMode?: LightSphereViewMode;
  targetPosition?: Vector3Like | null;
  onLightMove?: (position: Vector3Like) => void;
  onLightSettle?: (position: Vector3Like) => void;
  className?: string;
  style?: CSSProperties;
};

export type LightSphereConfigRef = MutableRefObject<LightSphereConfig>;
export type LightPositionRef = MutableRefObject<THREE.Vector3>;

export type LightDragHandlers = {
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (event: ThreeEvent<PointerEvent>) => void;
  onPointerUp: (event: ThreeEvent<PointerEvent>) => void;
  onPointerCancel: () => void;
};
