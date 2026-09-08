export { default as LightSphere } from "./LightSphere";
export type {
  LightSphereConfig,
  LightSphereProps,
  LightSphereViewMode,
  Vector3Like,
} from "./LightSphere.types";
export { BEAM_CONFIG, SPHERE_RADIUS } from "./LightSphere.constants";
export { sphericalPoint } from "./utils/geometry";

export { default as LightSpherePanel } from "./LightSpherePanel";
export { DEFAULT_LIGHT_SPHERE_PANEL_VALUE, LIGHT_POSITION_PRESETS } from "./LightSphere.constants";
export type { LightPositionKey, LightSpherePanelValue, LightSpherePanelProps, LightSphereActionButtonProps } from "./LightSphere.types";
