import React, { useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import CameraRig from "./parts/CameraRig";
import Mannequin from "./parts/Mannequin";
import PropMesh from "./parts/PropMesh";
import Transformable from "./parts/Transformable";
import type {
  DirectorCamera,
  DirectorComposition,
  DirectorSelection,
  DirectorTransform,
  DirectorTransformMode,
  DirectorViewMode,
  Vector3Like,
} from "./DirectorStage.types";

type DirectorStageCanvasProps = {
  composition: DirectorComposition;
  selection: DirectorSelection;
  transformMode: DirectorTransformMode;
  viewMode: DirectorViewMode;
  activeCameraId: string | null;
  orbitEnabled?: boolean;
  onSelect: (selection: DirectorSelection) => void;
  onTransform: (transform: Partial<DirectorTransform>) => void;
  onDragChange?: (dragging: boolean) => void;
};

const DEFAULT_CAMERA = {
  director: { position: new THREE.Vector3(4.2, 3.1, 6.0), target: new THREE.Vector3(0, 1.05, -0.3), fov: 42 },
  front: { position: new THREE.Vector3(0, 1.6, 7.2), target: new THREE.Vector3(0, 1, 0), fov: 38 },
  top: { position: new THREE.Vector3(0, 8.2, 0.01), target: new THREE.Vector3(0, 0, 0), fov: 48 },
};

function toArray(vector: Vector3Like): [number, number, number] {
  return [vector.x, vector.y, vector.z];
}

function vectorFrom(vector: Vector3Like) {
  return new THREE.Vector3(vector.x, vector.y, vector.z);
}

function ViewController({
  viewMode,
  activeCamera,
  orbitEnabled = true,
}: {
  viewMode: DirectorViewMode;
  activeCamera?: DirectorCamera;
  orbitEnabled?: boolean;
}) {
  const { camera, gl } = useThree();

  useEffect(() => {
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    if (viewMode === "camera" && activeCamera) {
      perspectiveCamera.position.copy(vectorFrom(activeCamera.position));
      perspectiveCamera.lookAt(vectorFrom(activeCamera.lookAt));
      perspectiveCamera.fov = activeCamera.fov;
    } else {
      const preset = DEFAULT_CAMERA[viewMode === "camera" ? "director" : viewMode];
      perspectiveCamera.position.copy(preset.position);
      perspectiveCamera.lookAt(preset.target);
      perspectiveCamera.fov = preset.fov;
    }
    perspectiveCamera.updateProjectionMatrix();
  }, [activeCamera, camera, viewMode]);

  return (
    <OrbitControls
      args={[camera, gl.domElement]}
      enabled={viewMode !== "camera" && orbitEnabled}
      enableDamping
      dampingFactor={0.08}
      makeDefault
      maxDistance={12}
      minDistance={2.4}
      target={DEFAULT_CAMERA.director.target}
    />
  );
}

function StageScene({
  composition,
  selection,
  transformMode,
  viewMode,
  activeCameraId,
  orbitEnabled,
  onSelect,
  onTransform,
  onDragChange,
}: DirectorStageCanvasProps) {
  const activeCamera = composition.cameras.find((camera) => camera.id === activeCameraId);
  const skyColor = composition.environment.skyColor;

  return (
    <>
      <color attach="background" args={[skyColor]} />
      <fog attach="fog" args={[skyColor, 8, 18]} />
      <ViewController viewMode={viewMode} activeCamera={activeCamera} orbitEnabled={orbitEnabled} />
      <ambientLight intensity={0.78} />
      <hemisphereLight args={["#ffffff", "#d8d1c4", 1.35]} />
      <directionalLight
        castShadow
        intensity={2.1}
        position={[4, 5.5, 3]}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={18}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <group onPointerMissed={() => onSelect(null)}>
        {composition.environment.showGround ? (
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.006, 0]}>
            <planeGeometry args={[42, 42]} />
            <meshStandardMaterial color="#f6f6f4" roughness={0.82} metalness={0.02} transparent opacity={Math.max(0.75, composition.environment.groundOpacity)} />
          </mesh>
        ) : null}
        <Grid
          args={[18, 18]}
          cellColor="#e9e9e7"
          cellSize={0.5}
          fadeDistance={16}
          fadeStrength={1.1}
          sectionColor="#d8d8d3"
          sectionSize={2}
        />
        {composition.characters.filter((character) => character.visible).map((character) => (
          <Transformable
            key={character.id}
            selected={selection?.kind === "character" && selection.id === character.id && !character.locked}
            transform={character}
            mode={transformMode}
            onSelect={() => onSelect({ kind: "character", id: character.id })}
            onTransform={onTransform}
            onDragChange={onDragChange}
          >
            <Mannequin character={character} selected={selection?.kind === "character" && selection.id === character.id} />
          </Transformable>
        ))}
        {composition.props.filter((prop) => prop.visible).map((prop) => (
          <Transformable
            key={prop.id}
            selected={selection?.kind === "prop" && selection.id === prop.id && !prop.locked}
            transform={prop}
            mode={transformMode}
            onSelect={() => onSelect({ kind: "prop", id: prop.id })}
            onTransform={onTransform}
            onDragChange={onDragChange}
          >
            <PropMesh prop={prop} selected={selection?.kind === "prop" && selection.id === prop.id} />
          </Transformable>
        ))}
        {composition.cameras
          .filter((camera) => camera.visible && !(viewMode === "camera" && camera.id === activeCameraId))
          .map((camera) => (
          <Transformable
            key={camera.id}
            selected={selection?.kind === "camera" && selection.id === camera.id && !camera.locked}
            transform={{
              position: camera.position,
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 1 },
            }}
            mode="translate"
            onSelect={() => onSelect({ kind: "camera", id: camera.id })}
            onTransform={onTransform}
            onDragChange={onDragChange}
          >
            <CameraRig camera={camera} selected={selection?.kind === "camera" && selection.id === camera.id} />
          </Transformable>
        ))}
      </group>
    </>
  );
}

export default function DirectorStageCanvas(props: DirectorStageCanvasProps) {
  const [orbitEnabled, setOrbitEnabled] = useState(true);
  const sceneProps = {
    ...props,
    orbitEnabled,
    onDragChange: (dragging: boolean) => {
      setOrbitEnabled(!dragging);
      props.onDragChange?.(dragging);
    },
  };

  return (
    <Canvas
      shadows
      camera={{ position: toArray(DEFAULT_CAMERA.director.position), fov: DEFAULT_CAMERA.director.fov, near: 0.05, far: 80 }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      dpr={[1, 2]}
    >
      <StageScene {...sceneProps} />
    </Canvas>
  );
}
