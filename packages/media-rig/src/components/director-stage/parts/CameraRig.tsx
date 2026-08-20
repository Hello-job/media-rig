import React, { useMemo } from "react";
import * as THREE from "three";
import type { DirectorCamera } from "../DirectorStage.types";

type CameraRigProps = {
  camera: DirectorCamera;
  selected?: boolean;
};

export default function CameraRig({ camera, selected }: CameraRigProps) {
  const geometry = useMemo(() => {
    const origin = new THREE.Vector3(0, 0, 0);
    const far = 0.72;
    const width = 0.46;
    const height = 0.28;
    const corners = [
      new THREE.Vector3(-width, -height, -far),
      new THREE.Vector3(width, -height, -far),
      new THREE.Vector3(width, height, -far),
      new THREE.Vector3(-width, height, -far),
    ];
    const points = [
      origin, corners[0],
      origin, corners[1],
      origin, corners[2],
      origin, corners[3],
      corners[0], corners[1],
      corners[1], corners[2],
      corners[2], corners[3],
      corners[3], corners[0],
    ];

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const look = new THREE.Vector3(
    camera.lookAt.x - camera.position.x,
    camera.lookAt.y - camera.position.y,
    camera.lookAt.z - camera.position.z,
  );
  const yaw = Math.atan2(look.x, look.z);
  const pitch = Math.atan2(-look.y, Math.sqrt(look.x * look.x + look.z * look.z));

  return (
    <group rotation={[pitch, yaw + Math.PI, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.26, 0.28]} />
        <meshStandardMaterial color={selected ? "#f7d36b" : "#2f3640"} roughness={0.45} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, -0.24]} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.18, 0.2, 24]} />
        <meshStandardMaterial color="#111827" roughness={0.35} metalness={0.45} />
      </mesh>
      <lineSegments>
        <primitive object={geometry} attach="geometry" />
        <lineBasicMaterial color={selected ? "#f7d36b" : "#9ca3af"} transparent opacity={0.76} />
      </lineSegments>
    </group>
  );
}
