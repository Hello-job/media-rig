import React, { useMemo } from "react";
import * as THREE from "three";
import type { DirectorProp } from "../DirectorStage.types";

type PropMeshProps = {
  prop: DirectorProp;
  selected?: boolean;
};

function Standard({ color }: { color: string }) {
  return <meshStandardMaterial color={color} roughness={0.74} metalness={0.08} />;
}

function Chair({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.7, 0.12, 0.65]} />
        <Standard color={color} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.02, -0.28]} rotation={[0.16, 0, 0]}>
        <boxGeometry args={[0.72, 0.88, 0.12]} />
        <Standard color={color} />
      </mesh>
      {[-0.28, 0.28].map((x) => [-0.25, 0.25].map((z) => (
        <mesh key={`${x}-${z}`} castShadow receiveShadow position={[x, 0.27, z]}>
          <cylinderGeometry args={[0.045, 0.055, 0.54, 10]} />
          <Standard color="#5c5148" />
        </mesh>
      )))}
    </group>
  );
}

function Sofa({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.38, 0]}>
        <boxGeometry args={[1.55, 0.34, 0.72]} />
        <Standard color={color} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.82, -0.3]}>
        <boxGeometry args={[1.62, 0.75, 0.18]} />
        <Standard color={color} />
      </mesh>
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 0.55, 0]}>
          <boxGeometry args={[0.18, 0.48, 0.78]} />
          <Standard color={color} />
        </mesh>
      ))}
    </group>
  );
}

function Table({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.72, 0]}>
        <boxGeometry args={[1.35, 0.14, 0.82]} />
        <Standard color={color} />
      </mesh>
      {[-0.52, 0.52].map((x) => [-0.28, 0.28].map((z) => (
        <mesh key={`${x}-${z}`} castShadow receiveShadow position={[x, 0.36, z]}>
          <cylinderGeometry args={[0.045, 0.055, 0.72, 10]} />
          <Standard color="#4b4138" />
        </mesh>
      )))}
    </group>
  );
}

function RoundTable() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.58, 0]}>
        <cylinderGeometry args={[0.48, 0.48, 0.08, 42]} />
        <Standard color="#c4ad90" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.56, 18]} />
        <Standard color="#a89174" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.08, 32]} />
        <Standard color="#b39a7b" />
      </mesh>
    </group>
  );
}

function Car({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.34, 0]}>
        <boxGeometry args={[1.85, 0.38, 0.88]} />
        <Standard color={color} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.16, 0.7, -0.04]}>
        <boxGeometry args={[1.02, 0.34, 0.74]} />
        <Standard color="#25313d" />
      </mesh>
      {[-0.72, 0.72].map((x) => [-0.48, 0.48].map((z) => (
        <mesh key={`${x}-${z}`} castShadow receiveShadow position={[x, 0.2, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.14, 28]} />
          <Standard color="#06091a" />
        </mesh>
      )))}
    </group>
  );
}

function Bed() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.32, 0]}>
        <boxGeometry args={[1.55, 0.22, 0.92]} />
        <Standard color="#bfc6cd" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.5, -0.32]}>
        <boxGeometry args={[1.48, 0.16, 0.28]} />
        <Standard color="#f1f1ef" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.62, 0.44]}>
        <boxGeometry args={[1.6, 0.62, 0.12]} />
        <Standard color="#a98a6a" />
      </mesh>
    </group>
  );
}

export default function PropMesh({ prop, selected }: PropMeshProps) {
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: prop.color, roughness: 0.7 }), [prop.color]);

  const primitive = (() => {
    switch (prop.propType) {
      case "sphere":
        return (
          <mesh castShadow receiveShadow material={material} position={[0, 0.55, 0]}>
            <sphereGeometry args={[0.48, 32, 22]} />
          </mesh>
        );
      case "cylinder":
        return (
          <mesh castShadow receiveShadow material={material} position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.35, 0.42, 1.1, 28]} />
          </mesh>
        );
      case "cone":
        return (
          <mesh castShadow receiveShadow material={material} position={[0, 0.52, 0]}>
            <coneGeometry args={[0.46, 1.05, 28]} />
          </mesh>
        );
      case "torus":
        return (
          <mesh castShadow receiveShadow material={material} position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.42, 0.1, 16, 42]} />
          </mesh>
        );
      case "chair":
        return <Chair color={prop.color} />;
      case "sofa":
        return <Sofa color={prop.color} />;
      case "table":
        return <Table color={prop.color} />;
      case "roundTable":
        return <RoundTable />;
      case "bed":
        return <Bed />;
      case "car":
        return <Car color={prop.color} />;
      case "column":
        return (
          <mesh castShadow receiveShadow material={material} position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.24, 0.3, 1.6, 32]} />
          </mesh>
        );
      default:
        return (
          <mesh castShadow receiveShadow material={material} position={[0, 0.42, 0]}>
            <boxGeometry args={[0.82, 0.82, 0.82]} />
          </mesh>
        );
    }
  })();

  return (
    <group>
      {primitive}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.026, 0]} visible={selected}>
        <ringGeometry args={[0.54, 0.66, 48]} />
        <meshBasicMaterial color="#f7d36b" transparent opacity={0.9} side={THREE.DoubleSide} depthTest={false} />
      </mesh>
    </group>
  );
}
