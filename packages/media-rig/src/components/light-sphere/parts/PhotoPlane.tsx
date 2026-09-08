import { useFrame, useLoader } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import type { LightPositionRef, LightSphereViewMode } from "../LightSphere.types";
import { getPhotoPlaneSize } from "../utils/photo-plane-size";
import { photoPlaneFragment, photoPlaneVertex } from "../shaders";

type PhotoPlaneProps = {
  lightRef: LightPositionRef;
  imageUrl: string;
  viewMode?: LightSphereViewMode;
};

export default function PhotoPlane({
  lightRef,
  imageUrl,
  viewMode = "front",
}: PhotoPlaneProps) {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  const material = useRef<THREE.ShaderMaterial>(null);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const image = texture.image as HTMLImageElement;
  const planeSize = getPhotoPlaneSize(
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
  );
  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uLight: { value: lightRef.current.clone() },
    }),
    [lightRef, texture],
  );

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
        <planeGeometry args={[planeSize.width, planeSize.height, 96, 96]} />
        <shaderMaterial
          ref={material}
          side={THREE.DoubleSide}
          uniforms={uniforms}
          vertexShader={photoPlaneVertex}
          fragmentShader={photoPlaneFragment}
        />
      </mesh>
      <mesh position={[0, 0, -0.018]}>
        <boxGeometry
          args={[planeSize.width + 0.04, planeSize.height + 0.04, 0.035]}
        />
        <meshStandardMaterial
          color="#111111"
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}
