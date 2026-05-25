import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TARGET } from "../LightSphere.constants";
import type { LightPositionRef, LightSphereConfigRef } from "../LightSphere.types";
import { beamVertex, beamFragment } from "../shaders";

type BeamProps = {
  lightRef: LightPositionRef;
  configRef: LightSphereConfigRef;
};

export default function Beam({ lightRef, configRef }: BeamProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const cone = useMemo(() => new THREE.ConeGeometry(1, 1, 96, 1, true), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          color: { value: new THREE.Color(configRef.current.color) },
          uIntensity: { value: configRef.current.intensity },
        },
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
      }),
    [],
  );

  useFrame(() => {
    const cfg = configRef.current;
    material.uniforms.color.value.set(cfg.color);
    material.uniforms.uIntensity.value = cfg.intensity;

    const lightPosition = lightRef.current;
    const direction = TARGET.clone().sub(lightPosition);
    const length = direction.length();
    if (length < 0.001) return;
    const forward = direction.normalize();
    const midpoint = lightPosition.clone().add(TARGET).multiplyScalar(0.5);
    const radius = Math.min(0.72, length * cfg.spread);

    if (!mesh.current) return;
    mesh.current.position.copy(midpoint);
    mesh.current.scale.set(radius, length, radius);
    mesh.current.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, -1, 0),
      forward,
    );
  });

  return <mesh ref={mesh} geometry={cone} material={material} renderOrder={25} />;
}
