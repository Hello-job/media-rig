import * as THREE from "three";
import type { LightSphereConfig } from "./LightSphere.types";

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
