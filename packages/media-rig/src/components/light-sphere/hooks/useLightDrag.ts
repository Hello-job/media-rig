import { useEffect, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { LightDragHandlers, LightPositionRef } from "../LightSphere.types";

type PointerCaptureTarget = EventTarget & {
  setPointerCapture?: (pointerId: number) => void;
  releasePointerCapture?: (pointerId: number) => void;
};

export function useLightDrag(
  lightRef: LightPositionRef,
  settleLight: () => void,
  sphereRadius: number,
): LightDragHandlers {
  const dragging = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSettleTimer = () => {
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
  };

  useEffect(() => () => clearSettleTimer(), []);

  const updateFromPointer = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    clearSettleTimer();

    const hit = new THREE.Vector3();
    const sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), sphereRadius);
    const hasHit = event.ray?.intersectSphere(sphere, hit);

    if (hasHit) {
      lightRef.current.copy(hit);
    } else if (event.point) {
      const projected = event.point.clone().normalize().multiplyScalar(sphereRadius);
      if (lightRef.current.distanceTo(projected) < 1.5) {
        lightRef.current.copy(projected);
      }
    }

    settleTimer.current = setTimeout(settleLight, 520);
  };

  return {
    onPointerDown: (event) => {
      clearSettleTimer();
      const target = event.target as PointerCaptureTarget;
      target.setPointerCapture?.(event.pointerId);
      dragging.current = true;
      updateFromPointer(event);
    },
    onPointerMove: (event) => {
      if (dragging.current) updateFromPointer(event);
    },
    onPointerUp: (event) => {
      clearSettleTimer();
      const target = event.target as PointerCaptureTarget;
      target.releasePointerCapture?.(event.pointerId);
      dragging.current = false;
      settleLight();
    },
    onPointerCancel: () => {
      dragging.current = false;
      settleLight();
    },
  };
}
