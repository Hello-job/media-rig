import * as THREE from "three";
import type { LightSphereConfig, LightPositionKey, LightSpherePanelValue } from "./LightSphere.types";

export const SPHERE_RADIUS = 2.45;
export const TARGET = new THREE.Vector3(0, 0.05, 0);

export const BEAM_CONFIG: Omit<LightSphereConfig, "sphereRadius"> = {
  color: "#ff2200",
  spread: 0.38,
  intensity: 0.72,
  glowRadius: 1.8,
  glowIntensity: 1.2,
  baseLineOpacity: 0.045,
};

export const LIGHT_POSITION_PRESETS: { key: LightPositionKey; label: string; lat: number; lon: number }[] = [
  { key: "left", label: "左侧", lat: 0, lon: 170 },
  { key: "top", label: "顶部", lat: 90, lon: 0 },
  { key: "right", label: "右侧", lat: 0, lon: 10 },
  { key: "front", label: "前方", lat: 0, lon: 90 },
  { key: "bottom", label: "底部", lat: -90, lon: 0 },
  { key: "back", label: "后方", lat: 0, lon: -90 },
];

export const DEFAULT_LIGHT_SPHERE_PANEL_VALUE: LightSpherePanelValue = {
  position: { x: 0, y: 0, z: SPHERE_RADIUS },
  intensity: 0.5,
  colorTemperature: 5600,
  activePosition: "front",
  viewMode: "perspective",
  rimLightEnabled: true,
};
