import React, { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";
import Mannequin from "./parts/Mannequin";
import PropMesh from "./parts/PropMesh";
import type { DirectorCamera, DirectorComposition, Vector3Like } from "./DirectorStage.types";

type CameraMonitorProps = {
  camera?: DirectorCamera;
  composition: DirectorComposition;
  compact?: boolean;
};

function vectorFrom(vector: Vector3Like) {
  return new THREE.Vector3(vector.x, vector.y, vector.z);
}

function CameraViewController({ camera: directorCamera }: { camera?: DirectorCamera }) {
  const { camera } = useThree();

  useEffect(() => {
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    if (!directorCamera) {
      perspectiveCamera.position.set(0, 1.45, 4.8);
      perspectiveCamera.lookAt(0, 1, 0);
      perspectiveCamera.fov = 42;
    } else {
      perspectiveCamera.position.copy(vectorFrom(directorCamera.position));
      perspectiveCamera.lookAt(vectorFrom(directorCamera.lookAt));
      perspectiveCamera.fov = directorCamera.fov;
    }
    perspectiveCamera.updateProjectionMatrix();
  }, [camera, directorCamera]);

  return null;
}

function MonitorScene({ camera, composition }: CameraMonitorProps) {
  const skyColor = composition.environment.skyColor;

  return (
    <>
      <color attach="background" args={["#f4f4f3"]} />
      <fog attach="fog" args={[skyColor, 10, 22]} />
      <CameraViewController camera={camera} />
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#ffffff", "#d2c8b6", 1.4]} />
      <directionalLight castShadow intensity={2} position={[4.5, 6, 4]} />
      {composition.environment.showGround ? (
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.006, 0]}>
          <planeGeometry args={[42, 42]} />
          <meshStandardMaterial color="#ededeb" roughness={0.82} metalness={0.02} />
        </mesh>
      ) : null}
      <Grid
        args={[16, 16]}
        cellColor="#e1e1df"
        cellSize={0.5}
        fadeDistance={14}
        fadeStrength={1.4}
        sectionColor="#d0d0cc"
        sectionSize={2}
      />
      {composition.characters.filter((character) => character.visible).map((character) => (
        <group
          key={character.id}
          position={[character.position.x, character.position.y, character.position.z]}
          rotation={[
            character.rotation.x * Math.PI / 180,
            character.rotation.y * Math.PI / 180,
            character.rotation.z * Math.PI / 180,
          ]}
          scale={[character.scale.x, character.scale.y, character.scale.z]}
        >
          <Mannequin character={character} />
        </group>
      ))}
      {composition.props.filter((prop) => prop.visible).map((prop) => (
        <group
          key={prop.id}
          position={[prop.position.x, prop.position.y, prop.position.z]}
          rotation={[
            prop.rotation.x * Math.PI / 180,
            prop.rotation.y * Math.PI / 180,
            prop.rotation.z * Math.PI / 180,
          ]}
          scale={[prop.scale.x, prop.scale.y, prop.scale.z]}
        >
          <PropMesh prop={prop} />
        </group>
      ))}
    </>
  );
}

export default function CameraMonitor({ camera, composition, compact }: CameraMonitorProps) {
  return (
    <div className={compact ? "director-stage__camera-monitor is-compact" : "director-stage__camera-monitor"}>
      <div className="director-stage__camera-monitor-head">
        <span>{camera ? camera.label : "无机位"}</span>
        <strong>FOV {camera?.fov ?? 42}°</strong>
      </div>
      <div className="director-stage__camera-monitor-canvas">
        <Canvas
          shadows
          camera={{ position: [0, 1.45, 4.8], fov: camera?.fov ?? 42, near: 0.05, far: 80 }}
          dpr={[1, 2]}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <MonitorScene camera={camera} composition={composition} />
        </Canvas>
      </div>
    </div>
  );
}
