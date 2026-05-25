import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TARGET } from "../LightSphere.constants";
import type {
  LightSphereConfigRef,
  LightSphereViewMode,
  Vector3Like,
} from "../LightSphere.types";
import {
  sphericalPoint,
  generateSnapPoints,
  closestSnap,
} from "../utils/geometry";
import { useLightDrag } from "../hooks/useLightDrag";
import GlassSphere from "./GlassSphere";
import Beam from "./Beam";
import LightHandle from "./LightHandle";
import PhotoPlane from "./PhotoPlane";

type SnapAnimation = {
  from: THREE.Vector3;
  to: THREE.Vector3;
  elapsed: number;
  duration: number;
};

type LightSphereSceneProps = {
  configRef: LightSphereConfigRef;
  targetPosRef: React.MutableRefObject<Vector3Like | null | undefined>;
  imageUrl: string;
  viewMode: LightSphereViewMode;
  onLightMove?: (position: Vector3Like) => void;
  onLightSettle?: (position: Vector3Like) => void;
};

export default function LightSphereScene({
  configRef,
  targetPosRef,
  imageUrl,
  viewMode,
  onLightMove,
  onLightSettle,
}: LightSphereSceneProps) {
  const sphereRadius = configRef.current.sphereRadius;
  const lightRef = useRef(sphericalPoint(-45, 146, sphereRadius));
  const snapAnimation = useRef<SnapAnimation | null>(null);
  const lastTargetPos = useRef<Vector3Like | null | undefined>(null);
  const spotTarget = useRef<THREE.Object3D>(null);
  const spotLight = useRef<THREE.SpotLight>(null);
  const { camera } = useThree();

  const snapPoints = useMemo(
    () => generateSnapPoints(sphereRadius),
    [sphereRadius],
  );

  const settleLight = () => {
    const target = closestSnap(lightRef.current, snapPoints);
    if (lightRef.current.distanceTo(target) < 0.002) {
      if (onLightSettle) {
        const p = lightRef.current;
        onLightSettle({ x: p.x, y: p.y, z: p.z });
      }
      return;
    }

    snapAnimation.current = {
      from: lightRef.current.clone(),
      to: target,
      elapsed: 0,
      duration: 0.42,
    };
  };

  const dragHandlers = useLightDrag(lightRef, settleLight, sphereRadius);

  useFrame((_, delta) => {
    const desiredCameraPosition =
      viewMode === "perspective"
        ? new THREE.Vector3(10.2, 2.0, 10.2)
        : new THREE.Vector3(0, 0.12, 8.65);

    camera.position.lerp(desiredCameraPosition, 0.12);
    camera.lookAt(0, viewMode === "perspective" ? 1.05 : 0.05, 0);
    if (spotLight.current) spotLight.current.position.copy(lightRef.current);

    // Check if targetPosition changed from parent (position preset buttons)
    const tp = targetPosRef?.current;
    if (tp && tp !== lastTargetPos.current) {
      lastTargetPos.current = tp;
      const to = new THREE.Vector3(tp.x, tp.y, tp.z);
      snapAnimation.current = {
        from: lightRef.current.clone(),
        to,
        elapsed: 0,
        duration: 0.5,
      };
    }

    // Fire onLightMove callback
    if (onLightMove) {
      const p = lightRef.current;
      onLightMove({ x: p.x, y: p.y, z: p.z });
    }

    if (!snapAnimation.current) return;

    const animation = snapAnimation.current;
    animation.elapsed += delta;
    const t = Math.min(animation.elapsed / animation.duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const point = animation.from.clone().lerp(animation.to, eased);
    lightRef.current.copy(point);

    if (t >= 1) {
      lightRef.current.copy(animation.to);
      snapAnimation.current = null;
      if (onLightSettle) {
        const p = animation.to;
        onLightSettle({ x: p.x, y: p.y, z: p.z });
      }
    }
  });

  const cfg = configRef.current;

  return (
    <>
      <color attach="background" args={["#20201f"]} />
      <fog attach="fog" args={["#20201f", 4.7, 8.5]} />

      <ambientLight intensity={0.42} />
      <directionalLight position={[1.8, 2.5, 2.2]} intensity={0.42} />
      <spotLight
        ref={spotLight}
        position={lightRef.current}
        target={spotTarget.current ?? undefined}
        color={cfg.color}
        intensity={24}
        angle={cfg.spread}
        penumbra={0.75}
        distance={6}
      />
      <object3D ref={spotTarget} position={TARGET} />

      <GlassSphere
        lightRef={lightRef}
        configRef={configRef}
        dragHandlers={dragHandlers}
      />
      <Beam lightRef={lightRef} configRef={configRef} />
      <LightHandle
        lightRef={lightRef}
        configRef={configRef}
        dragHandlers={dragHandlers}
      />
      <PhotoPlane lightRef={lightRef} imageUrl={imageUrl} viewMode={viewMode} />

      <OrbitControls
        enabled={false}
        enablePan={false}
        enableZoom={false}
        rotateSpeed={0.28}
        minPolarAngle={Math.PI * 0.33}
        maxPolarAngle={Math.PI * 0.68}
      />
    </>
  );
}
