import React, { useEffect, useState, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { GizmoHelper, GizmoViewport, Line, OrbitControls } from "@react-three/drei";
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
  onViewChange?: (camera: Pick<DirectorCamera, "position" | "lookAt" | "fov">) => void;
  motionPath?: [number, number, number][];
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
  director: { position: new THREE.Vector3(8, 6, 10), target: new THREE.Vector3(0, 1.2, 0), fov: 45 },
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
  onViewChange,
}: {
  viewMode: DirectorViewMode;
  activeCamera?: DirectorCamera;
  orbitEnabled?: boolean;
  onViewChange?: DirectorStageCanvasProps["onViewChange"];
}) {
  const { camera } = useThree();
  const controls = useRef<React.ElementRef<typeof OrbitControls>>(null);
  const previousMode = useRef<DirectorViewMode | null>(null);

  useEffect(() => {
    if (viewMode !== "camera" && previousMode.current === viewMode) return;
    previousMode.current = viewMode;
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    if (viewMode === "camera" && activeCamera) {
      perspectiveCamera.position.copy(vectorFrom(activeCamera.position));
      perspectiveCamera.lookAt(vectorFrom(activeCamera.lookAt));
      perspectiveCamera.fov = activeCamera.fov;
      perspectiveCamera.rotateZ(activeCamera.roll ?? 0);
    } else {
      const preset = DEFAULT_CAMERA[viewMode === "camera" ? "director" : viewMode];
      perspectiveCamera.position.copy(preset.position);
      perspectiveCamera.lookAt(preset.target);
      perspectiveCamera.fov = preset.fov;
    }
    const target = viewMode === "camera" && activeCamera ? vectorFrom(activeCamera.lookAt) : DEFAULT_CAMERA[viewMode === "camera" ? "director" : viewMode].target;
    controls.current?.target.copy(target);
    if (viewMode !== "camera") controls.current?.update();
    perspectiveCamera.updateProjectionMatrix();
  }, [activeCamera, camera, viewMode]);

  return (
    <OrbitControls
      ref={controls}
      onChange={() => {
        if (!controls.current) return;
        const target = controls.current.target;
        onViewChange?.({ position: { x: camera.position.x, y: camera.position.y, z: camera.position.z }, lookAt: { x: target.x, y: target.y, z: target.z }, fov: (camera as THREE.PerspectiveCamera).fov });
      }}
      enabled={viewMode !== "camera" && orbitEnabled}
      enableDamping
      dampingFactor={0.08}
      makeDefault
      maxDistance={50}
      minDistance={2}
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
  onViewChange,
  motionPath,
}: DirectorStageCanvasProps) {
  const activeCamera = composition.cameras.find((camera) => camera.id === activeCameraId);
  const skyColor = composition.environment.skyColor;

  return (
    <>
      {motionPath && viewMode === "director" && <Line points={motionPath} color="#22d3ee" lineWidth={2} />}
      <color attach="background" args={[skyColor]} />
      <ViewController viewMode={viewMode} activeCamera={activeCamera} orbitEnabled={orbitEnabled} onViewChange={onViewChange} />
      {viewMode === "director" && <GizmoHelper alignment="top-right" margin={[78, 78]}><GizmoViewport axisColors={["#ef4444", "#22d3ee", "#64748b"]} labelColor="white" /></GizmoHelper>}
      <ambientLight intensity={0.85} />
      <directionalLight
        castShadow
        intensity={2.3}
        position={[7, 12, 5]}
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
            <meshStandardMaterial color="#15191f" roughness={0.92} metalness={0.02} transparent opacity={composition.environment.groundOpacity} />
          </mesh>
        ) : null}
        <gridHelper args={[40, 40, "#155e75", "#164e63"]} />
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
          .filter((camera) => camera.visible && viewMode !== "camera")
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
      camera={{ position: toArray(DEFAULT_CAMERA.director.position), fov: DEFAULT_CAMERA.director.fov, near: 0.05, far: 300 }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      dpr={[1, 2]}
    >
      <StageScene {...sceneProps} />
    </Canvas>
  );
}
