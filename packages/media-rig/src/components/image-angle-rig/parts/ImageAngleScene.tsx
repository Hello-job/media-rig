import React, { useEffect, useMemo, useRef, useState } from "react";
import { RoundedBox } from "@react-three/drei";
import { useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import {
  clampImageAngle,
  getImageAngleCubeScale,
  resolveImageAngleDragAxis,
  type ImageAngleDragAxis,
} from "../ImageAngleRig.constants";
import type { ImageAngleState } from "../ImageAngleRig.types";

type ImageAngleSceneProps = {
  imageUrl: string;
  value: ImageAngleState;
  onChange: (value: ImageAngleState) => void;
  onChangeEnd: (value: ImageAngleState) => void;
  dragAxisLockThreshold: number;
};

type PointerCaptureTarget = EventTarget & {
  setPointerCapture?: (pointerId: number) => void;
  releasePointerCapture?: (pointerId: number) => void;
};

type DragStart = {
  pointerId: number;
  x: number;
  y: number;
  value: ImageAngleState;
  axis: ImageAngleDragAxis | null;
};

type FaceLetterProps = {
  children: string;
  position: [number, number, number];
  rotation: [number, number, number];
  size?: [number, number];
};

function createRoundedMaskTexture(size = 128, radius = 0.075) {
  const data = new Uint8Array(size * size * 4);
  const innerHalfSize = 0.5 - radius;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = (x + 0.5) / size;
      const v = (y + 0.5) / size;
      const qx = Math.abs(u - 0.5) - innerHalfSize;
      const qy = Math.abs(v - 0.5) - innerHalfSize;
      const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
      const inside = Math.min(Math.max(qx, qy), 0);
      const distance = outside + inside - radius;
      const alpha = THREE.MathUtils.clamp(0.5 - distance * size, 0, 1);
      const index = (y * size + x) * 4;
      const channel = Math.round(alpha * 255);
      data[index] = channel;
      data[index + 1] = channel;
      data[index + 2] = channel;
      data[index + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function FaceLetter({
  children,
  position,
  rotation,
  size = [0.5, 0.5],
}: FaceLetterProps) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, 128, 128);
    context.fillStyle = "#a4a6aa";
    context.font = "700 72px Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.translate(64, 64);
    context.fillText(children, 0, 3);

    const nextTexture = new THREE.CanvasTexture(canvas);
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.needsUpdate = true;
    setTexture(nextTexture);
    return () => nextTexture.dispose();
  }, [children]);

  if (!texture) return null;

  return (
    <mesh position={position} rotation={rotation} renderOrder={3}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.01}
        depthWrite={false}
        toneMapped={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

function AngleCamera({ wideAngle }: { wideAngle: boolean }) {
  const { camera } = useThree();

  useFrame(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const targetFov = wideAngle ? 52 : 34;
    const nextFov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.12);
    if (Math.abs(camera.fov - nextFov) < 0.01) return;
    camera.fov = nextFov;
    camera.updateProjectionMatrix();
  });

  return null;
}

function InteractiveImage({
  imageUrl,
  value,
  onChange,
  onChangeEnd,
  dragAxisLockThreshold,
}: ImageAngleSceneProps) {
  const texture = useLoader(THREE.TextureLoader, imageUrl);
  const dragStart = useRef<DragStart | null>(null);
  const latestValue = useRef(value);
  const { gl } = useThree();

  latestValue.current = value;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());

  const squareTexture = useMemo(() => {
    const nextTexture = texture.clone();
    const image = texture.image as { width?: number; height?: number } | undefined;
    const ratio = image?.width && image?.height ? image.width / image.height : 0.78;
    const baseRepeatX = ratio > 1 ? 1 / ratio : 1;
    const baseRepeatY = ratio > 1 ? 1 : ratio;
    const repeatX = baseRepeatX;
    const repeatY = baseRepeatY;

    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    nextTexture.wrapS = THREE.ClampToEdgeWrapping;
    nextTexture.wrapT = THREE.ClampToEdgeWrapping;
    nextTexture.repeat.set(repeatX, repeatY);
    nextTexture.offset.set((1 - repeatX) / 2, (1 - repeatY) / 2);
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [gl, texture]);

  const roundedMaskTexture = useMemo(() => createRoundedMaskTexture(), []);

  useEffect(() => () => squareTexture.dispose(), [squareTexture]);
  useEffect(() => () => roundedMaskTexture.dispose(), [roundedMaskTexture]);

  useEffect(() => () => {
    gl.domElement.style.cursor = "";
  }, [gl]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const target = event.target as PointerCaptureTarget;
    target.setPointerCapture?.(event.pointerId);
    dragStart.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      value: latestValue.current,
      axis: null,
    };
    gl.domElement.style.cursor = "grabbing";
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    const start = dragStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    event.stopPropagation();
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const resolvedAxis = resolveImageAngleDragAxis(deltaX, deltaY, dragAxisLockThreshold);
    if (!start.axis || resolvedAxis === "both") start.axis = resolvedAxis;
    if (!start.axis) return;

    const nextValue = {
      ...start.value,
      yaw: start.axis !== "pitch"
        ? clampImageAngle("yaw", start.value.yaw - deltaX * 0.34)
        : start.value.yaw,
      pitch: start.axis !== "yaw"
        ? clampImageAngle("pitch", start.value.pitch - deltaY * 0.3)
        : start.value.pitch,
    };
    latestValue.current = nextValue;
    onChange(nextValue);
  };

  const finishDrag = (event?: ThreeEvent<PointerEvent>) => {
    const start = dragStart.current;
    if (!start) return;
    if (event) {
      const target = event.target as PointerCaptureTarget;
      target.releasePointerCapture?.(start.pointerId);
      event.stopPropagation();
    }
    dragStart.current = null;
    gl.domElement.style.cursor = "grab";
    onChangeEnd(latestValue.current);
  };

  return (
    <group
      rotation={[
        THREE.MathUtils.degToRad(-value.pitch),
        THREE.MathUtils.degToRad(-value.yaw),
        0,
      ]}
      scale={getImageAngleCubeScale(value.zoom)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={() => finishDrag()}
      onPointerOver={() => {
        if (!dragStart.current) gl.domElement.style.cursor = "grab";
      }}
      onPointerOut={() => {
        if (!dragStart.current) gl.domElement.style.cursor = "";
      }}
    >
      <RoundedBox
        args={[2.2, 2.2, 2.2]}
        radius={0.18}
        smoothness={5}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#303235"
          emissive="#101113"
          emissiveIntensity={0.45}
          roughness={0.94}
          metalness={0.015}
        />
      </RoundedBox>

      <mesh position={[0, 0, 1.108]} renderOrder={2}>
        <planeGeometry args={[2.08, 2.08]} />
        <meshBasicMaterial
          map={squareTexture}
          alphaMap={roundedMaskTexture}
          transparent
          alphaTest={0.02}
          toneMapped={false}
          side={THREE.FrontSide}
        />
      </mesh>

      <FaceLetter
        position={[0, 1.122, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        size={[0.5, 1.15]}
      >
        T
      </FaceLetter>
      <FaceLetter position={[1.122, 0, 0]} rotation={[0, Math.PI / 2, 0]}>R</FaceLetter>
      <FaceLetter position={[-1.122, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>L</FaceLetter>
      <FaceLetter position={[0, -1.122, 0]} rotation={[Math.PI / 2, 0, 0]}>D</FaceLetter>
      <FaceLetter position={[0, 0, -1.122]} rotation={[0, Math.PI, 0]}>B</FaceLetter>
    </group>
  );
}

export default function ImageAngleScene(props: ImageAngleSceneProps) {
  return (
    <>
      <color attach="background" args={["#151618"]} />
      <fog attach="fog" args={["#151618", 7.5, 12]} />
      <ambientLight intensity={0.76} />
      <directionalLight position={[3, 4.5, 5]} intensity={1.3} />
      <directionalLight position={[-3, -1, 2]} intensity={0.48} color="#aeb8cf" />
      <AngleCamera wideAngle={props.value.wideAngle} />
      <InteractiveImage {...props} />
    </>
  );
}
