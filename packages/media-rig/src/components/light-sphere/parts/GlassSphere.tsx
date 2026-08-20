import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type {
  LightDragHandlers,
  LightPositionRef,
  LightSphereConfigRef,
} from "../LightSphere.types";
import { makeLatitude, makeMeridian, makeRing, generateSnapPoints } from "../utils/geometry";
import { glowLineVertex, glowLineFragment, glassSphereVertex, glassSphereFragment } from "../shaders";

type GlowLineProps = {
  points: number[][];
  lightRef: LightPositionRef;
  configRef: LightSphereConfigRef;
  baseOpacity: number;
};

function GlowLine({ points, lightRef, configRef, baseOpacity }: GlowLineProps) {
  const lineObj = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(points.length * 3);
    for (let i = 0; i < points.length; i++) {
      positions[i * 3] = points[i][0];
      positions[i * 3 + 1] = points[i][1];
      positions[i * 3 + 2] = points[i][2];
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uLightPos: { value: new THREE.Vector3() },
        uLightColor: { value: new THREE.Color(configRef.current.color) },
        uGlowRadius: { value: configRef.current.glowRadius },
        uGlowIntensity: { value: configRef.current.glowIntensity },
        uBaseOpacity: { value: baseOpacity },
      },
      vertexShader: glowLineVertex,
      fragmentShader: glowLineFragment,
    });

    return new THREE.Line(geo, mat);
  }, [points, baseOpacity]);

  useFrame(() => {
    if (lineObj.material) {
      const cfg = configRef.current;
      lineObj.material.uniforms.uLightPos.value.copy(lightRef.current);
      lineObj.material.uniforms.uLightColor.value.set(cfg.color);
      lineObj.material.uniforms.uGlowRadius.value = cfg.glowRadius;
      lineObj.material.uniforms.uGlowIntensity.value = cfg.glowIntensity;
    }
  });

  return <primitive object={lineObj} />;
}

type SnapPointProps = {
  point: THREE.Vector3;
  lightRef: LightPositionRef;
  configRef: LightSphereConfigRef;
  important: boolean;
};

function SnapPoint({ point, lightRef, configRef, important }: SnapPointProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const cfg = configRef.current;
    const distance = point.distanceTo(lightRef.current);
    const active = 1 - THREE.MathUtils.smoothstep(distance, 0.12, cfg.glowRadius * 0.5);
    const baseOpacity = important ? 0.32 : 0.18;
    const opacity = baseOpacity + active * 0.62;
    const scale = (important ? 1.2 : 1) + active * 1.1;

    if (!mesh.current || !material.current) return;
    material.current.opacity = opacity;
    const beamColor = new THREE.Color(cfg.color);
    material.current.color.copy(beamColor).multiplyScalar(0.3 + active * 0.7);
    const baseColor = new THREE.Color("#e7e7e2");
    material.current.color.lerp(baseColor, 1.0 - active);
    mesh.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={mesh} position={point}>
      <sphereGeometry args={[important ? 0.05 : 0.034, 16, 16]} />
      <meshBasicMaterial
        ref={material}
        color="#e7e7e2"
        transparent
        opacity={important ? 0.32 : 0.18}
        depthWrite={false}
      />
    </mesh>
  );
}

type GlassSphereProps = {
  lightRef: LightPositionRef;
  configRef: LightSphereConfigRef;
  dragHandlers: LightDragHandlers;
};

export default function GlassSphere({ lightRef, configRef, dragHandlers }: GlassSphereProps) {
  const sphereRadius = configRef.current.sphereRadius;

  const rings = useMemo(
    () => [
      makeLatitude(-54, sphereRadius),
      makeLatitude(-27, sphereRadius),
      makeLatitude(0, sphereRadius),
      makeLatitude(27, sphereRadius),
      makeLatitude(54, sphereRadius),
      makeMeridian(34, sphereRadius),
      makeMeridian(62, sphereRadius),
      makeMeridian(90, sphereRadius),
      makeMeridian(118, sphereRadius),
      makeMeridian(146, sphereRadius),
      makeRing("z", 0, sphereRadius),
    ],
    [sphereRadius],
  );

  const snapPoints = useMemo(() => generateSnapPoints(sphereRadius), [sphereRadius]);

  return (
    <group>
      <mesh {...dragHandlers}>
        <sphereGeometry args={[sphereRadius, 96, 96]} />
        <shaderMaterial
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          uniforms={{
            uColor: { value: new THREE.Color("#c7c7c3") },
          }}
          vertexShader={glassSphereVertex}
          fragmentShader={glassSphereFragment}
        />
      </mesh>

      {rings.map((points, index) => (
        <GlowLine
          key={index}
          points={points}
          lightRef={lightRef}
          configRef={configRef}
          baseOpacity={index === 10 ? 0.09 : configRef.current.baseLineOpacity}
        />
      ))}

      {snapPoints.map((point, index) => (
        <SnapPoint
          key={index}
          point={point}
          lightRef={lightRef}
          configRef={configRef}
          important={index > 24}
        />
      ))}
    </group>
  );
}
