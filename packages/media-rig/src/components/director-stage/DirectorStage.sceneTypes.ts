import type { DirectorCamera, DirectorCharacter, DirectorProp } from "./DirectorStage.types";

export type SceneItem =
  | { kind: "character"; item: DirectorCharacter }
  | { kind: "prop"; item: DirectorProp }
  | { kind: "camera"; item: DirectorCamera };

export type ToolMenu = "mode" | "character" | "prop" | "camera" | "aspect" | null;
