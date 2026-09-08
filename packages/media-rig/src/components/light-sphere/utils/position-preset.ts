import {
  LIGHT_POSITION_PRESETS,
  SPHERE_RADIUS,
} from "../LightSphere.constants";
import type {
  LightPositionKey,
  Vector3Like,
} from "../LightSphere.types";
import { sphericalPoint } from "./geometry";

const PRESET_POSITION_TOLERANCE = 0.02;

export function resolveLightPositionPresetKey(
  position: Vector3Like,
): LightPositionKey | null {
  for (const preset of LIGHT_POSITION_PRESETS) {
    const presetPosition = sphericalPoint(
      preset.lat,
      preset.lon,
      SPHERE_RADIUS,
    );
    const distance = Math.hypot(
      position.x - presetPosition.x,
      position.y - presetPosition.y,
      position.z - presetPosition.z,
    );
    if (distance <= PRESET_POSITION_TOLERANCE) return preset.key;
  }

  return null;
}
