import { useEffect, useMemo, useReducer } from "react";
import {
  DEFAULT_COMPOSITION,
  DEFAULT_ENVIRONMENT,
  DEFAULT_JOINTS,
  defaultCamera,
  defaultCharacter,
  defaultProp,
} from "../DirectorStage.constants";
import type {
  DirectorCamera,
  DirectorCharacter,
  DirectorComposition,
  DirectorEnvironment,
  DirectorProp,
  DirectorPropType,
  DirectorSelection,
  DirectorTransform,
  DirectorTransformMode,
  DirectorViewMode,
  JointAngles,
  ParsedSceneSeed,
} from "../DirectorStage.types";

type StageState = {
  composition: DirectorComposition;
  selection: DirectorSelection;
  transformMode: DirectorTransformMode;
  viewMode: DirectorViewMode;
  activeCameraId: string | null;
};

type Action =
  | { type: "select"; selection: DirectorSelection }
  | { type: "setTransformMode"; mode: DirectorTransformMode }
  | { type: "setViewMode"; mode: DirectorViewMode; cameraId?: string | null }
  | { type: "addCharacter"; modelUrl?: string; label?: string; bodyType?: DirectorCharacter["bodyType"]; position?: DirectorCharacter["position"] }
  | { type: "addProp"; propType: DirectorPropType; label?: string; position?: DirectorProp["position"] }
  | { type: "addCamera"; camera?: Partial<DirectorCamera> }
  | { type: "removeSelected" }
  | { type: "removeItem"; selection: Exclude<DirectorSelection, null> }
  | { type: "duplicateItem"; selection: Exclude<DirectorSelection, null> }
  | { type: "setItemVisible"; selection: Exclude<DirectorSelection, null>; visible: boolean }
  | { type: "setItemLocked"; selection: Exclude<DirectorSelection, null>; locked: boolean }
  | { type: "updateCharacter"; id: string; patch: Partial<DirectorCharacter> }
  | { type: "updateProp"; id: string; patch: Partial<DirectorProp> }
  | { type: "updateCamera"; id: string; patch: Partial<DirectorCamera> }
  | { type: "transformSelected"; transform: Partial<DirectorTransform> }
  | { type: "updateEnvironment"; patch: Partial<DirectorEnvironment> }
  | { type: "importSeed"; seed: ParsedSceneSeed };

const cloneComposition = (composition: DirectorComposition): DirectorComposition => ({
  characters: composition.characters.map((item) => ({
    ...item,
    position: { ...item.position },
    rotation: { ...item.rotation },
    scale: { ...item.scale },
    jointAngles: structuredClone(item.jointAngles),
    locked: item.locked ?? false,
  })),
  props: composition.props.map((item) => ({
    ...item,
    position: { ...item.position },
    rotation: { ...item.rotation },
    scale: { ...item.scale },
    locked: item.locked ?? false,
  })),
  cameras: composition.cameras.map((item) => ({
    ...item,
    position: { ...item.position },
    lookAt: { ...item.lookAt },
    locked: item.locked ?? false,
  })),
  environment: { ...composition.environment },
});

const mergeInitialComposition = (initial?: Partial<DirectorComposition>): DirectorComposition => {
  const base = cloneComposition(DEFAULT_COMPOSITION);
  return {
    characters: initial?.characters?.length ? initial.characters.map((item, index) => ({
      ...defaultCharacter(index),
      ...item,
      position: { ...defaultCharacter(index).position, ...item.position },
      rotation: { ...defaultCharacter(index).rotation, ...item.rotation },
      scale: { ...defaultCharacter(index).scale, ...item.scale },
      jointAngles: { ...structuredClone(DEFAULT_JOINTS), ...item.jointAngles } as JointAngles,
      locked: item.locked ?? false,
    })) : base.characters,
    props: initial?.props?.length ? initial.props.map((item, index) => ({
      ...defaultProp(index, item.propType),
      ...item,
      position: { ...defaultProp(index, item.propType).position, ...item.position },
      rotation: { ...defaultProp(index, item.propType).rotation, ...item.rotation },
      scale: { ...defaultProp(index, item.propType).scale, ...item.scale },
      locked: item.locked ?? false,
    })) : base.props,
    cameras: initial?.cameras?.length ? initial.cameras.map((item, index) => ({
      ...defaultCamera(index),
      ...item,
      position: { ...defaultCamera(index).position, ...item.position },
      lookAt: { ...defaultCamera(index).lookAt, ...item.lookAt },
      locked: item.locked ?? false,
    })) : base.cameras,
    environment: { ...DEFAULT_ENVIRONMENT, ...initial?.environment },
  };
};

const selectAfterRemoval = (composition: DirectorComposition): DirectorSelection => {
  if (composition.cameras[0]) return { kind: "camera", id: composition.cameras[0].id };
  if (composition.characters[0]) return { kind: "character", id: composition.characters[0].id };
  if (composition.props[0]) return { kind: "prop", id: composition.props[0].id };
  return null;
};

function reducer(state: StageState, action: Action): StageState {
  switch (action.type) {
    case "select":
      return {
        ...state,
        selection: action.selection,
        activeCameraId: action.selection?.kind === "camera" ? action.selection.id : state.activeCameraId,
      };
    case "setTransformMode":
      return { ...state, transformMode: action.mode };
    case "setViewMode":
      return {
        ...state,
        viewMode: action.mode,
        activeCameraId: action.cameraId ?? (action.mode === "camera" ? state.composition.cameras[0]?.id ?? null : state.activeCameraId),
      };
    case "addCharacter": {
      const next = {
        ...defaultCharacter(state.composition.characters.length),
        ...(action.modelUrl ? { bodyType: "custom" as const, modelUrl: action.modelUrl, animationMode: "static" as const } : {}),
        ...(action.bodyType ? { bodyType: action.bodyType } : {}),
        ...(action.label ? { label: action.label } : {}),
        ...(action.position ? { position: action.position } : {}),
      };
      return {
        ...state,
        composition: { ...state.composition, characters: [...state.composition.characters, next] },
        selection: { kind: "character", id: next.id },
      };
    }
    case "addProp": {
      const next = {
        ...defaultProp(state.composition.props.length, action.propType),
        ...(action.label ? { label: action.label } : {}),
        ...(action.position ? { position: action.position } : {}),
      };
      return {
        ...state,
        composition: { ...state.composition, props: [...state.composition.props, next] },
        selection: { kind: "prop", id: next.id },
      };
    }
    case "addCamera": {
      const next = {
        ...defaultCamera(state.composition.cameras.length),
        ...action.camera,
        position: { ...defaultCamera(state.composition.cameras.length).position, ...action.camera?.position },
        lookAt: { ...defaultCamera(state.composition.cameras.length).lookAt, ...action.camera?.lookAt },
      };
      return {
        ...state,
        composition: { ...state.composition, cameras: [...state.composition.cameras, next] },
        selection: { kind: "camera", id: next.id },
        activeCameraId: next.id,
      };
    }
    case "removeSelected": {
      if (!state.selection) return state;
      return reducer(state, { type: "removeItem", selection: state.selection });
    }
    case "removeItem": {
      const composition = {
        ...state.composition,
        characters: action.selection.kind === "character"
          ? state.composition.characters.filter((item) => item.id !== action.selection.id)
          : state.composition.characters,
        props: action.selection.kind === "prop"
          ? state.composition.props.filter((item) => item.id !== action.selection.id)
          : state.composition.props,
        cameras: action.selection.kind === "camera"
          ? state.composition.cameras.filter((item) => item.id !== action.selection.id)
          : state.composition.cameras,
      };
      const removedSelected = state.selection?.kind === action.selection.kind && state.selection.id === action.selection.id;
      return {
        ...state,
        composition,
        selection: removedSelected ? selectAfterRemoval(composition) : state.selection,
        activeCameraId: composition.cameras.some((camera) => camera.id === state.activeCameraId)
          ? state.activeCameraId
          : composition.cameras[0]?.id ?? null,
      };
    }
    case "duplicateItem": {
      if (action.selection.kind === "character") {
        const source = state.composition.characters.find((item) => item.id === action.selection.id);
        if (!source) return state;
        const next: DirectorCharacter = {
          ...source,
          id: `character-${crypto.randomUUID()}`,
          label: `${source.label} Copy`,
          position: { ...source.position, x: source.position.x + 0.45, z: source.position.z + 0.35 },
          rotation: { ...source.rotation },
          scale: { ...source.scale },
          jointAngles: structuredClone(source.jointAngles),
          locked: false,
        };
        return {
          ...state,
          composition: { ...state.composition, characters: [...state.composition.characters, next] },
          selection: { kind: "character", id: next.id },
        };
      }
      if (action.selection.kind === "prop") {
        const source = state.composition.props.find((item) => item.id === action.selection.id);
        if (!source) return state;
        const next: DirectorProp = {
          ...source,
          id: `prop-${crypto.randomUUID()}`,
          label: `${source.label} Copy`,
          position: { ...source.position, x: source.position.x + 0.45, z: source.position.z + 0.35 },
          rotation: { ...source.rotation },
          scale: { ...source.scale },
          locked: false,
        };
        return {
          ...state,
          composition: { ...state.composition, props: [...state.composition.props, next] },
          selection: { kind: "prop", id: next.id },
        };
      }
      const source = state.composition.cameras.find((item) => item.id === action.selection.id);
      if (!source) return state;
      const next: DirectorCamera = {
        ...source,
        id: `camera-${crypto.randomUUID()}`,
        label: `${source.label} Copy`,
        position: { ...source.position, x: source.position.x + 0.45, z: source.position.z + 0.35 },
        lookAt: { ...source.lookAt },
        locked: false,
      };
      return {
        ...state,
        composition: { ...state.composition, cameras: [...state.composition.cameras, next] },
        selection: { kind: "camera", id: next.id },
        activeCameraId: next.id,
      };
    }
    case "setItemVisible": {
      if (action.selection.kind === "character") {
        return reducer(state, { type: "updateCharacter", id: action.selection.id, patch: { visible: action.visible } });
      }
      if (action.selection.kind === "prop") {
        return reducer(state, { type: "updateProp", id: action.selection.id, patch: { visible: action.visible } });
      }
      return reducer(state, { type: "updateCamera", id: action.selection.id, patch: { visible: action.visible } });
    }
    case "setItemLocked": {
      if (action.selection.kind === "character") {
        return reducer(state, { type: "updateCharacter", id: action.selection.id, patch: { locked: action.locked } });
      }
      if (action.selection.kind === "prop") {
        return reducer(state, { type: "updateProp", id: action.selection.id, patch: { locked: action.locked } });
      }
      return reducer(state, { type: "updateCamera", id: action.selection.id, patch: { locked: action.locked } });
    }
    case "updateCharacter":
      return {
        ...state,
        composition: {
          ...state.composition,
          characters: state.composition.characters.map((item) => item.id === action.id ? { ...item, ...action.patch } : item),
        },
      };
    case "updateProp":
      return {
        ...state,
        composition: {
          ...state.composition,
          props: state.composition.props.map((item) => item.id === action.id ? { ...item, ...action.patch } : item),
        },
      };
    case "updateCamera":
      return {
        ...state,
        composition: {
          ...state.composition,
          cameras: state.composition.cameras.map((item) => item.id === action.id ? { ...item, ...action.patch } : item),
        },
      };
    case "transformSelected": {
      if (!state.selection) return state;
      if (state.selection.kind === "character") {
        const current = state.composition.characters.find((item) => item.id === state.selection?.id);
        if (current?.locked) return state;
        return reducer(state, { type: "updateCharacter", id: state.selection.id, patch: action.transform });
      }
      if (state.selection.kind === "prop") {
        const current = state.composition.props.find((item) => item.id === state.selection?.id);
        if (current?.locked) return state;
        return reducer(state, { type: "updateProp", id: state.selection.id, patch: action.transform });
      }
      const current = state.composition.cameras.find((item) => item.id === state.selection?.id);
      if (current?.locked) return state;
      return reducer(state, {
        type: "updateCamera",
        id: state.selection.id,
        patch: action.transform.position ? { position: action.transform.position } : {},
      });
    }
    case "updateEnvironment":
      return {
        ...state,
        composition: {
          ...state.composition,
          environment: { ...state.composition.environment, ...action.patch },
        },
      };
    case "importSeed": {
      const characters = action.seed.characters?.map((item, index) => ({
        ...defaultCharacter(index),
        ...item,
        id: `character-${crypto.randomUUID()}`,
        position: { ...defaultCharacter(index).position, ...item.position },
        rotation: { ...defaultCharacter(index).rotation, ...item.rotation },
        scale: { ...defaultCharacter(index).scale, ...item.scale },
        jointAngles: { ...structuredClone(DEFAULT_JOINTS), ...item.jointAngles } as JointAngles,
        locked: item.locked ?? false,
      })) ?? state.composition.characters;
      const props = action.seed.props?.map((item, index) => ({
        ...defaultProp(index, item.propType),
        ...item,
        id: `prop-${crypto.randomUUID()}`,
        position: { ...defaultProp(index, item.propType).position, ...item.position },
        rotation: { ...defaultProp(index, item.propType).rotation, ...item.rotation },
        scale: { ...defaultProp(index, item.propType).scale, ...item.scale },
        locked: item.locked ?? false,
      })) ?? state.composition.props;
      const cameras = action.seed.cameras?.map((item, index) => ({
        ...defaultCamera(index),
        ...item,
        id: `camera-${crypto.randomUUID()}`,
        position: { ...defaultCamera(index).position, ...item.position },
        lookAt: { ...defaultCamera(index).lookAt, ...item.lookAt },
        locked: item.locked ?? false,
      })) ?? state.composition.cameras;
      const composition = {
        ...state.composition,
        characters,
        props,
        cameras,
        environment: { ...state.composition.environment, ...action.seed.environment },
      };
      return {
        ...state,
        composition,
        selection: selectAfterRemoval(composition),
        activeCameraId: cameras[0]?.id ?? null,
      };
    }
    default:
      return state;
  }
}

export function useDirectorStage(initial?: Partial<DirectorComposition>, storageKey?: string | false) {
  const initializer = () => {
    const fallback = mergeInitialComposition(initial);
    if (!storageKey || typeof window === "undefined") {
      return fallback;
    }
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        return mergeInitialComposition(JSON.parse(stored) as Partial<DirectorComposition>);
      }
    } catch {
      // Ignore corrupt local drafts and rebuild from defaults.
    }
    return fallback;
  };

  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const composition = initializer();
    return {
      composition,
      selection: selectAfterRemoval(composition),
      transformMode: "translate" as DirectorTransformMode,
      viewMode: "director" as DirectorViewMode,
      activeCameraId: composition.cameras[0]?.id ?? null,
    };
  });

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(state.composition));
  }, [state.composition, storageKey]);

  const selected = useMemo(() => {
    if (!state.selection) return null;
    if (state.selection.kind === "character") {
      return state.composition.characters.find((item) => item.id === state.selection?.id) ?? null;
    }
    if (state.selection.kind === "prop") {
      return state.composition.props.find((item) => item.id === state.selection?.id) ?? null;
    }
    return state.composition.cameras.find((item) => item.id === state.selection?.id) ?? null;
  }, [state.composition, state.selection]);

  return { state, selected, dispatch };
}
