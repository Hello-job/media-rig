import type { ComponentType, CSSProperties, MouseEventHandler, MutableRefObject } from "react";
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

export type LightPositionKey = "left" | "top" | "right" | "front" | "bottom" | "back";

export type LightSpherePanelValue = {
  position: Vector3Like;
  intensity: number;
  colorTemperature: number;
  activePosition: LightPositionKey | null;
  viewMode: LightSphereViewMode;
  /** Output option, matching tamen-web; does not add a second preview light. */
  rimLightEnabled: boolean;
};

export type LightSphereActionButtonProps = {
  className: string;
  value: LightSpherePanelValue;
  input?: unknown;
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled: boolean;
  loading: boolean;
};

export type LightSpherePanelProps = {
  imageUrl?: string;
  value?: Partial<LightSpherePanelValue>;
  defaultValue?: Partial<LightSpherePanelValue>;
  onChange?: (value: LightSpherePanelValue) => void;
  onChangeEnd?: (value: LightSpherePanelValue) => void;
  onClose?: () => void;
  actionButton?: ComponentType<LightSphereActionButtonProps>;
  actionInput?: unknown;
  actionLoading?: boolean;
  actionDisabled?: boolean;
  onAction?: (payload: { value: LightSpherePanelValue; input?: unknown }, event: Parameters<MouseEventHandler<HTMLButtonElement>>[0]) => void;
  className?: string;
  style?: CSSProperties;
};
