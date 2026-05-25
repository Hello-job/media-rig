import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TARGET } from "../LightSphere.constants";
import type {
  LightDragHandlers,
  LightPositionRef,
  LightSphereConfigRef,
} from "../LightSphere.types";
import { lightHandleVertex, lightHandleFragment, glowDiscVertex, glowDiscFragment } from "../shaders";

type LightHandleProps = {
  lightRef: LightPositionRef;
  configRef: LightSphereConfigRef;
  dragHandlers: LightDragHandlers;
};

export default function LightHandle({ lightRef, configRef, dragHandlers }: LightHandleProps) {
  const group = useRef<THREE.Group>(null);
  const sphereMaterial = useRef<THREE.ShaderMaterial>(null);
  const glowMesh = useRef<THREE.Mesh>(null);
  const glowMaterial = useRef<THREE.ShaderMaterial>(null);

  useFrame(() => {
    const cfg = configRef.current;
    if (!group.current) return;
    group.current.position.copy(lightRef.current);

    const beamDir = TARGET.clone().sub(lightRef.current).normalize();

    if (sphereMaterial.current) {
      sphereMaterial.current.uniforms.uBeamColor.value.set(cfg.color);
      sphereMaterial.current.uniforms.uBeamDir.value.copy(beamDir);
    }
    if (glowMaterial.current) {
      glowMaterial.current.uniforms.uBeamColor.value.set(cfg.color);
    }

    if (glowMesh.current) {
      const discPos = beamDir.clone().multiplyScalar(0.16);
      glowMesh.current.position.copy(discPos);
      glowMesh.current.lookAt(discPos.clone().add(beamDir));
    }
  });

  const sphereShader = useMemo(() => ({
    uniforms: {
      uBeamColor: { value: new THREE.Color(configRef.current.color) },
      uBeamDir: { value: new THREE.Vector3(0, -1, 0) },
    },
    vertexShader: lightHandleVertex,
    fragmentShader: lightHandleFragment,
  }), []);

  const glowDiscShader = useMemo(() => ({
    uniforms: {
      uBeamColor: { value: new THREE.Color(configRef.current.color) },
    },
    vertexShader: glowDiscVertex,
    fragmentShader: glowDiscFragment,
  }), []);

  return (
    <group ref={group} position={lightRef.current}>
      <mesh {...dragHandlers} renderOrder={20}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <shaderMaterial
          ref={sphereMaterial}
          {...sphereShader}
          depthWrite={true}
          depthTest={true}
          transparent={true}
        />
      </mesh>
      <mesh ref={glowMesh} renderOrder={30} raycast={() => null}>
        <planeGeometry args={[0.5, 0.5]} />
        <shaderMaterial
          ref={glowMaterial}
          {...glowDiscShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
