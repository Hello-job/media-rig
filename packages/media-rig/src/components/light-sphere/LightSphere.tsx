import React, { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { BEAM_CONFIG, SPHERE_RADIUS } from "./LightSphere.constants";
import LightSphereScene from "./parts/LightSphereScene";
import type { LightSphereConfig, LightSphereProps } from "./LightSphere.types";

export default function LightSphere({
  imageUrl = "/assets/photo-texture2.png",
  color = BEAM_CONFIG.color,
  spread = BEAM_CONFIG.spread,
  intensity = BEAM_CONFIG.intensity,
  glowRadius = BEAM_CONFIG.glowRadius,
  glowIntensity = BEAM_CONFIG.glowIntensity,
  baseLineOpacity = BEAM_CONFIG.baseLineOpacity,
  sphereRadius = SPHERE_RADIUS,
  viewMode = "front",
  targetPosition,
  onLightMove,
  onLightSettle,
  className = "",
  style,
}: LightSphereProps) {
  const configRef = useRef<LightSphereConfig>({
    color,
    spread,
    intensity,
    glowRadius,
    glowIntensity,
    baseLineOpacity,
    sphereRadius,
  });

  const targetPosRef = useRef(targetPosition);

  // 将属性同步到 ref，避免触发 Canvas 重新渲染。
  useEffect(() => {
    configRef.current = {
      color,
      spread,
      intensity,
      glowRadius,
      glowIntensity,
      baseLineOpacity,
      sphereRadius,
    };
  }, [color, spread, intensity, glowRadius, glowIntensity, baseLineOpacity, sphereRadius]);

  // 将目标位置同步到 ref。
  useEffect(() => {
    targetPosRef.current = targetPosition;
  }, [targetPosition]);

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      <Canvas
        camera={{ position: [0, 0.12, 8.65], fov: 34 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
      >
        <LightSphereScene
          configRef={configRef}
          targetPosRef={targetPosRef}
          imageUrl={imageUrl}
          viewMode={viewMode}
          onLightMove={onLightMove}
          onLightSettle={onLightSettle}
        />
      </Canvas>
    </div>
  );
}
