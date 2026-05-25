import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { LightPositionRef, LightSphereViewMode } from "../LightSphere.types";
import { photoPlaneVertex, photoPlaneFragment } from "../shaders";

type PhotoPlaneProps = {
  lightRef: LightPositionRef;
  imageUrl: string;
  viewMode?: LightSphereViewMode;
};

export default function PhotoPlane({ lightRef, imageUrl, viewMode = "front" }: PhotoPlaneProps) {
  const texture = useMemo(
    () => new THREE.TextureLoader().load(imageUrl),
    [imageUrl],
  );
  const material = useRef<THREE.ShaderMaterial>(null);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  useFrame(() => {
    if (material.current)
      material.current.uniforms.uLight.value.copy(lightRef.current);
  });

  return (
    <group
      position={[0, 0.02, -0.02]}
      rotation={viewMode === "perspective" ? [0, -0.08, 0] : [0, -0.08, 0]}
    >
      <mesh castShadow receiveShadow>
        <planeGeometry args={[1.12, 1.78, 96, 96]} />
        <shaderMaterial
          ref={material}
          transparent={false}
          side={THREE.DoubleSide}
          uniforms={{
            uMap: { value: texture },
            uLight: { value: lightRef.current.clone() },
          }}
          vertexShader={photoPlaneVertex}
          fragmentShader={photoPlaneFragment}
        />
      </mesh>
      <mesh position={[0, 0, -0.018]}>
        <boxGeometry args={[1.16, 1.82, 0.035]} />
        <meshStandardMaterial
          color="#111111"
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}
