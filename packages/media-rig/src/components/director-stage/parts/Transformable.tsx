import { TransformControls } from "@react-three/drei";
import React, { useState } from "react";
import * as THREE from "three";
import type { DirectorTransform, DirectorTransformMode, Vector3Like } from "../DirectorStage.types";

type TransformableProps = {
  selected: boolean;
  mode: DirectorTransformMode;
  transform: DirectorTransform;
  children: React.ReactNode;
  onSelect: () => void;
  onTransform: (transform: Partial<DirectorTransform>) => void;
  onDragChange?: (dragging: boolean) => void;
};

const toVector = (value: Vector3Like) => [value.x, value.y, value.z] as [number, number, number];
const toRotation = (value: Vector3Like) => [value.x * Math.PI / 180, value.y * Math.PI / 180, value.z * Math.PI / 180] as [number, number, number];
const fromVector = (value: THREE.Vector3): Vector3Like => ({ x: value.x, y: value.y, z: value.z });
const fromEuler = (value: THREE.Euler): Vector3Like => ({
  x: value.x * 180 / Math.PI,
  y: value.y * 180 / Math.PI,
  z: value.z * 180 / Math.PI,
});

export default function Transformable({
  selected,
  mode,
  transform,
  children,
  onSelect,
  onTransform,
  onDragChange,
}: TransformableProps) {
  const [object, setObject] = useState<THREE.Group | null>(null);

  const emitTransform = () => {
    if (!object) return;
    onTransform({
      position: fromVector(object.position),
      rotation: fromEuler(object.rotation),
      scale: fromVector(object.scale),
    });
  };

  const group = (
    <group
      ref={setObject}
      position={toVector(transform.position)}
      rotation={toRotation(transform.rotation)}
      scale={toVector(transform.scale)}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      {children}
    </group>
  );

  return (
    <>
      {group}
      {selected && object ? (
        <TransformControls
          object={object}
          mode={mode}
          space="world"
          size={0.78}
          onObjectChange={emitTransform}
          onMouseDown={() => onDragChange?.(true)}
          onMouseUp={() => {
            onDragChange?.(false);
            emitTransform();
          }}
        />
      ) : null}
    </>
  );
}
