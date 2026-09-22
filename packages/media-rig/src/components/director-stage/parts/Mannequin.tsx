import { useAnimations, useGLTF } from "@react-three/drei";
import React, { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { DirectorCharacter, JointAngles } from "../DirectorStage.types";

import { getUe4BodyBoneScales, getUe4ModelScale } from "../body-scales";

const DEG = Math.PI / 180;
const BASE_QUATERNION_KEY = "directorStageBaseQuaternion";

type MannequinProps = {
  character: DirectorCharacter;
  selected?: boolean;
};

function limbMaterial(color: string, roughness = 0.64) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.04,
  });
}

function CapsuleLimb({
  length,
  radius,
  color,
  position,
  rotation,
}: {
  length: number;
  radius: number;
  color: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const material = useMemo(() => limbMaterial(color), [color]);
  return (
    <mesh position={position} rotation={rotation} material={material} castShadow receiveShadow>
      <capsuleGeometry args={[radius, length, 8, 16]} />
    </mesh>
  );
}

function applyArmRotation(joint: JointAngles["lArm"] | JointAngles["rArm"], side: "left" | "right"): [number, number, number] {
  const sign = side === "left" ? 1 : -1;
  return [
    joint.raise * DEG,
    joint.turn * DEG,
    sign * (Math.PI * 0.12 + Math.abs(joint.straddle) * DEG),
  ];
}

function applyLegRotation(joint: JointAngles["lLeg"] | JointAngles["rLeg"], side: "left" | "right"): [number, number, number] {
  const sign = side === "left" ? 1 : -1;
  return [joint.raise * DEG, 0, sign * Math.abs(joint.straddle) * DEG];
}

function BodyScale({ type }: { type: DirectorCharacter["bodyType"] }) {
  if (type === "female") return null;
  if (type === "child") return null;
  return null;
}

function ProceduralMannequin({ character, selected }: MannequinProps) {
  const joints = character.jointAngles;
  const tone = character.bodyType === "female" ? "#f0d0ba" : character.bodyType === "child" ? "#e2c3a7" : "#d8c1a8";
  const suit = character.color;
  const scale = character.bodyType === "female" ? [0.9, 0.94, 0.9] : character.bodyType === "child" ? [0.72, 0.68, 0.72] : [1, 1, 1];

  return (
    <group scale={scale as [number, number, number]}>
      <BodyScale type={character.bodyType} />
      <group rotation={[joints.torso.bend * DEG, joints.torso.turn * DEG, 0]}>
        <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
          <capsuleGeometry args={[0.34, 0.66, 12, 20]} />
          <meshStandardMaterial color={suit} roughness={0.72} metalness={0.05} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 1.66, 0]} rotation={[joints.head.nod * DEG, joints.head.turn * DEG, 0]}>
          <sphereGeometry args={[0.23, 24, 20]} />
          <meshStandardMaterial color={tone} roughness={0.58} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 1.42, 0]}>
          <boxGeometry args={[0.92, 0.16, 0.28]} />
          <meshStandardMaterial color={suit} roughness={0.68} />
        </mesh>

        <group position={[0.52, 1.38, 0]} rotation={applyArmRotation(joints.lArm, "left")}>
          <CapsuleLimb length={0.46} radius={0.07} color={tone} position={[0, -0.24, 0]} />
          <group position={[0, -0.52, 0]} rotation={[joints.lElbow.bend * DEG, 0, 0]}>
            <CapsuleLimb length={0.44} radius={0.06} color={tone} position={[0, -0.22, 0]} />
          </group>
        </group>
        <group position={[-0.52, 1.38, 0]} rotation={applyArmRotation(joints.rArm, "right")}>
          <CapsuleLimb length={0.46} radius={0.07} color={tone} position={[0, -0.24, 0]} />
          <group position={[0, -0.52, 0]} rotation={[joints.rElbow.bend * DEG, 0, 0]}>
            <CapsuleLimb length={0.44} radius={0.06} color={tone} position={[0, -0.22, 0]} />
          </group>
        </group>
      </group>

      <group position={[0.21, 0.82, 0]} rotation={applyLegRotation(joints.lLeg, "left")}>
        <CapsuleLimb length={0.58} radius={0.09} color={suit} position={[0, -0.31, 0]} />
        <group position={[0, -0.66, 0]} rotation={[joints.lKnee.bend * DEG, 0, 0]}>
          <CapsuleLimb length={0.52} radius={0.075} color={tone} position={[0, -0.27, 0]} />
        </group>
      </group>
      <group position={[-0.21, 0.82, 0]} rotation={applyLegRotation(joints.rLeg, "right")}>
        <CapsuleLimb length={0.58} radius={0.09} color={suit} position={[0, -0.31, 0]} />
        <group position={[0, -0.66, 0]} rotation={[joints.rKnee.bend * DEG, 0, 0]}>
          <CapsuleLimb length={0.52} radius={0.075} color={tone} position={[0, -0.27, 0]} />
        </group>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} visible={Boolean(selected)}>
        <ringGeometry args={[0.5, 0.62, 48]} />
        <meshBasicMaterial color={character.color} transparent opacity={0.9} side={THREE.DoubleSide} depthTest={false} />
      </mesh>
    </group>
  );
}

function normalizeBoneName(name: string) {
  return name.replace(/_\d+$/, "");
}

function resetBone(object: THREE.Object3D) {
  const baseQuaternion = object.userData[BASE_QUATERNION_KEY] as THREE.Quaternion | undefined;
  if (baseQuaternion) {
    object.quaternion.copy(baseQuaternion);
  }
}

function rotateBone(root: THREE.Object3D, boneName: string, rotation: [number, number, number]) {
  root.traverse((object) => {
    if (!(object instanceof THREE.Bone) || normalizeBoneName(object.name) !== boneName) return;
    resetBone(object);
    object.rotateX(rotation[0]);
    object.rotateY(rotation[1]);
    object.rotateZ(rotation[2]);
  });
}

function rotateBoneSet(root: THREE.Object3D, boneNames: string[], rotation: [number, number, number]) {
  boneNames.forEach((boneName) => rotateBone(root, boneName, rotation));
}

function applyMixamoPose(root: THREE.Object3D, joints: JointAngles) {
  if (root.getObjectByName("Bip001_Head_055")) {
    root.traverse((object) => { if (object instanceof THREE.Bone) resetBone(object); });
    const pose: Record<string, [number, number, number]> = {
      Bip001_Head: [joints.head.turn, 0, joints.head.nod],
      Bip001_Spine: [joints.torso.turn, 0, -joints.torso.bend],
      Bip001_L_UpperArm: [joints.lArm.turn, 25 + joints.lArm.straddle, -joints.lArm.raise],
      Bip001_R_UpperArm: [joints.rArm.turn, -25 + joints.rArm.straddle, -joints.rArm.raise],
      Bip001_L_Forearm: [0, 0, 25 - joints.lElbow.bend],
      Bip001_R_Forearm: [0, 0, 25 - joints.rElbow.bend],
      Bip001_L_Thigh: [0, -joints.lLeg.straddle, joints.lLeg.raise],
      Bip001_R_Thigh: [0, -joints.rLeg.straddle, joints.rLeg.raise],
      Bip001_L_Calf: [0, 0, -joints.lKnee.bend],
      Bip001_R_Calf: [0, 0, -joints.rKnee.bend],
    };
    Object.entries(pose).forEach(([bone, angles]) => rotateBone(root, bone, angles.map((v) => v * DEG) as [number, number, number]));
    return;
  }
  root.traverse((object) => {
    if (object instanceof THREE.Bone) resetBone(object);
  });

  rotateBoneSet(root, ["mixamorigSpine", "mixamorigSpine1", "mixamorigSpine2"], [
    (joints.torso.bend * DEG) / 3,
    (joints.torso.turn * DEG) / 3,
    0,
  ]);
  rotateBone(root, "mixamorigHead", [-joints.head.nod * DEG, joints.head.turn * DEG, 0]);

  rotateBone(root, "mixamorigLeftArm", [
    (90 - joints.lArm.raise) * DEG,
    joints.lArm.straddle * DEG * 0.35,
    joints.lArm.turn * DEG,
  ]);
  rotateBone(root, "mixamorigRightArm", [
    (90 - joints.rArm.raise) * DEG,
    joints.rArm.straddle * DEG * 0.35,
    -joints.rArm.turn * DEG,
  ]);
  rotateBone(root, "mixamorigLeftForeArm", [0, 0, joints.lElbow.bend * DEG]);
  rotateBone(root, "mixamorigRightForeArm", [0, 0, -joints.rElbow.bend * DEG]);

  rotateBone(root, "mixamorigLeftUpLeg", [
    joints.lLeg.raise * DEG,
    0,
    joints.lLeg.straddle * DEG * 0.55,
  ]);
  rotateBone(root, "mixamorigRightUpLeg", [
    joints.rLeg.raise * DEG,
    0,
    -joints.rLeg.straddle * DEG * 0.55,
  ]);
  rotateBone(root, "mixamorigLeftLeg", [joints.lKnee.bend * DEG, 0, 0]);
  rotateBone(root, "mixamorigRightLeg", [joints.rKnee.bend * DEG, 0, 0]);
}

function CustomModel({
  url,
  animationMode = "static",
  joints,
  color,
  bodyType,
}: {
  url: string;
  color: string;
  bodyType: DirectorCharacter["bodyType"];
  animationMode?: DirectorCharacter["animationMode"];
  joints: JointAngles;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(url);
  const clone = useMemo(() => {
    const next = cloneSkeleton(gltf.scene) as THREE.Object3D;
    next.traverse((object) => {
      if (object instanceof THREE.Bone) {
        object.userData[BASE_QUATERNION_KEY] = object.quaternion.clone();
        object.userData.directorStageBaseScale = object.scale.clone();
      }
      if ("castShadow" in object) object.castShadow = true;
      if ("receiveShadow" in object) object.receiveShadow = true;
      if (object instanceof THREE.Mesh || object instanceof THREE.SkinnedMesh) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        const opaqueMaterials = materials.map((material) => {
          const nextMaterial = material.clone();
          nextMaterial.transparent = false;
          nextMaterial.opacity = 1;
          nextMaterial.alphaTest = 0;
          nextMaterial.depthTest = true;
          nextMaterial.depthWrite = true;
          nextMaterial.side = THREE.FrontSide;
          nextMaterial.needsUpdate = true;
          return nextMaterial;
        });
        object.material = Array.isArray(object.material) ? opaqueMaterials : opaqueMaterials[0];
        object.renderOrder = 0;
      }
    });

    const box = new THREE.Box3().setFromObject(next);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const height = size.y || 1;
    const scale = 1.72 / height;
    next.scale.setScalar(scale);

    const normalizedBox = new THREE.Box3().setFromObject(next);
    const normalizedCenter = new THREE.Vector3();
    normalizedBox.getCenter(normalizedCenter);
    next.position.set(-normalizedCenter.x, -normalizedBox.min.y, -normalizedCenter.z);
    return next;
  }, [gltf.scene]);
  const { actions, mixer, names } = useAnimations(gltf.animations, groupRef);

  useEffect(() => {
    const firstAction = names[0] ? actions[names[0]] : undefined;
    if (!firstAction) return undefined;

    firstAction.reset();
    if (animationMode === "play") {
      firstAction.paused = false;
      firstAction.fadeIn(0.2).play();
    } else {
      mixer.stopAllAction();
      applyMixamoPose(clone, joints);
    }

    return () => {
      firstAction.fadeOut(0.2);
      firstAction.stop();
    };
  }, [actions, animationMode, clone, joints, mixer, names]);

  useEffect(() => {
    if (animationMode === "play") return;
    applyMixamoPose(clone, joints);
  }, [animationMode, clone, joints]);

  useEffect(() => {
    const scales = getUe4BodyBoneScales(bodyType);
    clone.traverse((object) => {
      if (object instanceof THREE.Bone && object.userData.directorStageBaseScale) {
        object.scale.copy(object.userData.directorStageBaseScale);
        if (scales[object.name]) object.scale.multiply(new THREE.Vector3(...scales[object.name]));
      }
      if (object instanceof THREE.Mesh) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (material instanceof THREE.MeshStandardMaterial) material.color.set(color);
        });
      }
    });
  }, [clone, color, bodyType]);

  return (
    <group ref={groupRef} scale={getUe4ModelScale(bodyType)}>
      <primitive object={clone} />
    </group>
  );
}

class ModelBoundary extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function Mannequin(props: MannequinProps) {
  if (props.character.modelUrl) {
    return (
      <ModelBoundary key={props.character.modelUrl} fallback={<ProceduralMannequin {...props} />}><Suspense fallback={null}>
        <group>
          <CustomModel
            url={props.character.modelUrl}
            color={props.character.color}
            bodyType={props.character.bodyType}
            animationMode={props.character.animationMode}
            joints={props.character.jointAngles}
          />
          {props.selected ? (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
              <ringGeometry args={[0.55, 0.67, 48]} />
              <meshBasicMaterial color={props.character.color} transparent opacity={0.82} side={THREE.DoubleSide} depthTest />
            </mesh>
          ) : null}
        </group>
      </Suspense></ModelBoundary>
    );
  }

  return <ProceduralMannequin {...props} />;
}
