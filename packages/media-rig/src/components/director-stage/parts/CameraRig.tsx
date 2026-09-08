import { useMemo } from "react";
import * as THREE from "three";
import type { DirectorCamera } from "../DirectorStage.types";
import { Line } from "@react-three/drei";

import {
  getCameraFrustumLines,
  getCameraHitArea,
} from "./camera-geometry";

type CameraRigProps = {
  camera: DirectorCamera;
  selected?: boolean;
};

const CAMERA_FRUSTUM_LINES = getCameraFrustumLines();
const CAMERA_HIT_AREA = getCameraHitArea();

export default function CameraRig({ camera, selected }: CameraRigProps) {
  const color = selected ? "#67e8f9" : "#60a5fa";
  const quaternion = useMemo(() => {
    const matrix = new THREE.Matrix4().lookAt(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z), new THREE.Vector3(camera.lookAt.x, camera.lookAt.y, camera.lookAt.z), new THREE.Vector3(0, 1, 0));
    return new THREE.Quaternion().setFromRotationMatrix(matrix).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), camera.roll ?? 0));
  }, [camera.position, camera.lookAt, camera.roll]);
  return (
    <group quaternion={quaternion}><group rotation={[0, Math.PI, 0]}>
      <mesh position={CAMERA_HIT_AREA.position}>
        <boxGeometry args={CAMERA_HIT_AREA.args} />
        <meshBasicMaterial depthWrite={false} opacity={0} transparent />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0, -0.18]}>
        <boxGeometry args={[0.46, 0.3, 0.36]} />
        <meshStandardMaterial
          color="#c97808"
          metalness={0.16}
          roughness={0.5}
        />
      </mesh>
      <mesh castShadow position={[0.255, 0, -0.18]}>
        <boxGeometry args={[0.05, 0.23, 0.26]} />
        <meshStandardMaterial
          color="#e39a20"
          metalness={0.2}
          roughness={0.44}
        />
      </mesh>
      <mesh castShadow position={[0, 0, -0.405]}>
        <boxGeometry args={[0.36, 0.23, 0.09]} />
        <meshStandardMaterial
          color="#27272a"
          metalness={0.18}
          roughness={0.66}
        />
      </mesh>

      <mesh castShadow position={[0, 0, 0.035]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.145, 0.145, 0.09, 24]} />
        <meshStandardMaterial
          color="#27272a"
          metalness={0.42}
          roughness={0.4}
        />
      </mesh>
      <mesh castShadow position={[0, 0, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.115, 0.13, 0.2, 24]} />
        <meshStandardMaterial
          color="#17181b"
          metalness={0.38}
          roughness={0.36}
        />
      </mesh>
      <mesh castShadow position={[0, 0, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.135, 0.135, 0.055, 24]} />
        <meshStandardMaterial
          color="#090a0c"
          metalness={0.5}
          roughness={0.28}
        />
      </mesh>
      <mesh position={[0, 0, 0.311]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.102, 0.102, 0.012, 24]} />
        <meshStandardMaterial
          color="#172a34"
          metalness={0.7}
          roughness={0.18}
        />
      </mesh>

      <mesh castShadow position={[-0.12, 0.225, -0.18]}>
        <boxGeometry args={[0.045, 0.16, 0.045]} />
        <meshStandardMaterial
          color="#202124"
          metalness={0.5}
          roughness={0.42}
        />
      </mesh>
      <mesh castShadow position={[0.12, 0.225, -0.18]}>
        <boxGeometry args={[0.045, 0.16, 0.045]} />
        <meshStandardMaterial
          color="#202124"
          metalness={0.5}
          roughness={0.42}
        />
      </mesh>
      <mesh castShadow position={[0, 0.305, -0.18]}>
        <boxGeometry args={[0.285, 0.055, 0.075]} />
        <meshStandardMaterial
          color="#28292d"
          metalness={0.46}
          roughness={0.42}
        />
      </mesh>
      <mesh castShadow position={[-0.12, 0.19, -0.07]}>
        <boxGeometry args={[0.08, 0.06, 0.08]} />
        <meshStandardMaterial
          color="#111214"
          metalness={0.4}
          roughness={0.48}
        />
      </mesh>

      {CAMERA_FRUSTUM_LINES.map((points, index) => (
        <Line
          key={`frustum-${index}`}
          color={color}
          lineWidth={0.8}
          opacity={0.34}
          points={points}
          transparent
        />
      ))}
    </group></group>
  );
}
