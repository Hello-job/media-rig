import React, { useEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import "./styles.css";

const SPHERE_RADIUS = 2.45;
const TARGET = new THREE.Vector3(0, 0.05, 0);

function sphericalPoint(latDeg, lonDeg, radius = SPHERE_RADIUS) {
  const lat = THREE.MathUtils.degToRad(latDeg);
  const lon = THREE.MathUtils.degToRad(lonDeg);
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.cos(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.sin(lon),
  );
}

function makeRing(axis, angleDeg) {
  const points = [];
  const radius = SPHERE_RADIUS * Math.cos(THREE.MathUtils.degToRad(angleDeg));
  const offset = SPHERE_RADIUS * Math.sin(THREE.MathUtils.degToRad(angleDeg));

  for (let i = 0; i <= 160; i += 1) {
    const a = (i / 160) * Math.PI * 2;
    if (axis === "y")
      points.push([Math.cos(a) * radius, offset, Math.sin(a) * radius]);
    if (axis === "x")
      points.push([offset, Math.cos(a) * radius, Math.sin(a) * radius]);
    if (axis === "z")
      points.push([Math.cos(a) * radius, Math.sin(a) * radius, offset]);
  }
  return points;
}

function makeLatitude(latDeg) {
  const points = [];
  for (let i = 0; i <= 140; i += 1) {
    const lon = (i / 140) * 180;
    const point = sphericalPoint(latDeg, lon, SPHERE_RADIUS + 0.012);
    points.push([point.x, point.y, point.z]);
  }
  return points;
}

function makeMeridian(lonDeg) {
  const points = [];
  for (let i = 0; i <= 140; i += 1) {
    const lat = -78 + (i / 140) * 156;
    const point = sphericalPoint(lat, lonDeg, SPHERE_RADIUS + 0.014);
    points.push([point.x, point.y, point.z]);
  }
  return points;
}

const snapPoints = [
  ...[-54, -27, 0, 27, 54].flatMap((lat) =>
    [34, 62, 90, 118, 146].map((lon) => sphericalPoint(lat, lon)),
  ),
  sphericalPoint(76, 90),
  sphericalPoint(-76, 90),
  sphericalPoint(0, 10),
  sphericalPoint(0, 170),
];

function closestSnap(point) {
  let nearest = point;
  let bestDistance = Infinity;

  for (const snapPoint of snapPoints) {
    const distance = point.distanceTo(snapPoint);
    if (distance < bestDistance) {
      bestDistance = distance;
      nearest = snapPoint;
    }
  }

  return nearest.clone();
}

function useLightDrag(lightRef, settleLight) {
  const dragging = useRef(false);
  const settleTimer = useRef(null);

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  const updateFromPointer = (event) => {
    event.stopPropagation();
    clearTimeout(settleTimer.current);

    const hit = new THREE.Vector3();
    const sphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), SPHERE_RADIUS);
    const point = event.ray?.intersectSphere(sphere, hit)
      ? hit
      : event.point.clone().normalize().multiplyScalar(SPHERE_RADIUS);

    lightRef.current.copy(point);
    settleTimer.current = setTimeout(settleLight, 520);
  };

  return {
    onPointerDown: (event) => {
      clearTimeout(settleTimer.current);
      event.target.setPointerCapture(event.pointerId);
      dragging.current = true;
      updateFromPointer(event);
    },
    onPointerMove: (event) => {
      if (dragging.current) updateFromPointer(event);
    },
    onPointerUp: (event) => {
      clearTimeout(settleTimer.current);
      event.target.releasePointerCapture(event.pointerId);
      dragging.current = false;
      settleLight();
    },
    onPointerCancel: () => {
      dragging.current = false;
      settleLight();
    },
  };
}

function GlassSphere({ lightRef, dragHandlers }) {
  const rings = useMemo(
    () => [
      makeLatitude(-54),
      makeLatitude(-27),
      makeLatitude(0),
      makeLatitude(27),
      makeLatitude(54),
      makeMeridian(34),
      makeMeridian(62),
      makeMeridian(90),
      makeMeridian(118),
      makeMeridian(146),
      makeRing("z", 0),
    ],
    [],
  );

  return (
    <group>
      <mesh {...dragHandlers}>
        <sphereGeometry args={[SPHERE_RADIUS, 96, 96]} />
        <shaderMaterial
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          uniforms={{
            uColor: { value: new THREE.Color("#c7c7c3") },
          }}
          vertexShader={`
            varying vec3 vNormal;
            varying vec3 vWorld;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              vec4 world = modelMatrix * vec4(position, 1.0);
              vWorld = world.xyz;
              gl_Position = projectionMatrix * viewMatrix * world;
            }
          `}
          fragmentShader={`
            uniform vec3 uColor;
            varying vec3 vNormal;
            varying vec3 vWorld;
            void main() {
              vec3 viewDir = normalize(cameraPosition - vWorld);
              float fresnel = pow(1.0 - abs(dot(normalize(vNormal), viewDir)), 2.1);
              float radius = smoothstep(0.7, 2.45, length(vWorld.xy));
              float verticalShade = smoothstep(-2.45, 1.9, vWorld.y);
              float alpha = 0.006 + radius * 0.105 + fresnel * 0.25 + verticalShade * 0.018;
              gl_FragColor = vec4(uColor, alpha);
            }
          `}
        />
      </mesh>

      {rings.map((points, index) => (
        <Line
          key={index}
          points={points}
          color="#ffffff"
          transparent
          opacity={index === 10 ? 0.105 : 0.055}
          lineWidth={0.34}
        />
      ))}

      {snapPoints.map((point, index) => (
        <SnapPoint
          key={index}
          point={point}
          lightRef={lightRef}
          important={index > 24}
        />
      ))}
    </group>
  );
}

function SnapPoint({ point, lightRef, important }) {
  const mesh = useRef();
  const material = useRef();

  useFrame(() => {
    const distance = point.distanceTo(lightRef.current);
    const active = 1 - THREE.MathUtils.smoothstep(distance, 0.12, 0.78);
    const baseOpacity = important ? 0.16 : 0.07;
    const opacity = baseOpacity + active * 0.42;
    const scale = (important ? 1.15 : 1) + active * 0.96;

    material.current.opacity = opacity;
    mesh.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={mesh} position={point}>
      <sphereGeometry args={[important ? 0.043 : 0.026, 16, 16]} />
      <meshBasicMaterial
        ref={material}
        color="#e7e7e2"
        transparent
        opacity={important ? 0.2 : 0.085}
        depthWrite={false}
      />
    </mesh>
  );
}

function LightHandle({ lightRef, dragHandlers }) {
  const group = useRef();
  const handleMaterial = useRef();
  const handleTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 96, 96);
    const body = ctx.createRadialGradient(38, 38, 6, 48, 48, 37);
    body.addColorStop(0, "#111111");
    body.addColorStop(0.72, "#000000");
    body.addColorStop(1, "#000000");
    ctx.beginPath();
    ctx.arc(48, 48, 36, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();

    const rim = ctx.createLinearGradient(22, 20, 78, 78);
    rim.addColorStop(0, "rgba(255,255,255,0.78)");
    rim.addColorStop(0.42, "rgba(255,255,255,0.18)");
    rim.addColorStop(0.72, "rgba(255,255,255,0.02)");
    ctx.save();
    ctx.beginPath();
    ctx.arc(48, 48, 36, -0.95 * Math.PI, 0.35 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = rim;
    ctx.lineCap = "round";
    ctx.stroke();
    ctx.restore();

    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255,255,255,0.38)";
    ctx.stroke();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  useFrame(() => {
    group.current.position.copy(lightRef.current);
    const direction = TARGET.clone().sub(lightRef.current);
    handleMaterial.current.rotation =
      Math.atan2(direction.y, direction.x) - Math.PI * 0.12;
  });

  return (
    <group ref={group} position={lightRef.current}>
      <sprite {...dragHandlers} renderOrder={40} scale={[0.55, 0.55, 1]}>
        <spriteMaterial
          ref={handleMaterial}
          map={handleTexture}
          transparent
          depthTest={false}
          depthWrite={false}
        />
      </sprite>
      <mesh visible={false}>
        <sphereGeometry args={[0.145, 32, 32]} />
        <meshBasicMaterial color="#000000" depthTest={false} />
      </mesh>
      <mesh visible={false} scale={1.08}>
        <sphereGeometry args={[0.145, 32, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          depthTest={false}
        />
      </mesh>
      <Billboard>
        <mesh raycast={() => null} renderOrder={30}>
          <circleGeometry args={[0.19, 40]} />
          <meshBasicMaterial
            color="#000000"
            side={THREE.DoubleSide}
            transparent
            opacity={1}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
        <mesh raycast={() => null} renderOrder={31}>
          <ringGeometry args={[0.19, 0.215, 40]} />
          <meshBasicMaterial
            color="#ffffff"
            side={THREE.DoubleSide}
            transparent
            opacity={0.28}
            depthTest={false}
            depthWrite={false}
          />
        </mesh>
        <Line
          raycast={() => null}
          points={[
            [-0.28, 0, 0],
            [-0.18, 0, 0],
            [0.18, 0, 0],
            [0.28, 0, 0],
          ]}
          color="#ffffff"
          lineWidth={1.55}
          depthTest={false}
        />
        <Line
          raycast={() => null}
          points={[
            [0, -0.28, 0],
            [0, -0.18, 0],
            [0, 0.18, 0],
            [0, 0.28, 0],
          ]}
          color="#ffffff"
          lineWidth={1.55}
          depthTest={false}
        />
      </Billboard>
    </group>
  );
}

function Beam({ lightRef }) {
  const mesh = useRef();
  const cone = useMemo(() => new THREE.ConeGeometry(1, 1, 96, 1, true), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: {
          color: { value: new THREE.Color("#ffffff") },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          varying vec2 vUv;
          void main() {
            float openAtSource = smoothstep(0.02, 0.16, vUv.y);
            float fadeToImage = 1.0 - smoothstep(0.25, 0.98, vUv.y);
            float sourceHotspot = 1.0 - smoothstep(0.0, 0.22, vUv.y);
            float beam = openAtSource * (0.035 + fadeToImage * 0.54 + sourceHotspot * 0.46);
            gl_FragColor = vec4(color, beam);
          }
        `,
      }),
    [],
  );

  useFrame(() => {
    const lightPosition = lightRef.current;
    const direction = TARGET.clone().sub(lightPosition);
    const length = direction.length();
    if (length < 0.001) return;
    const forward = direction.normalize();
    const midpoint = lightPosition.clone().add(TARGET).multiplyScalar(0.5);
    const radius = Math.min(0.72, length * 0.2);

    mesh.current.position.copy(midpoint);
    mesh.current.scale.set(radius, length, radius);
    mesh.current.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, -1, 0),
      forward,
    );
  });

  return <mesh ref={mesh} geometry={cone} material={material} />;
}

function PhotoPlane({ lightRef }) {
  const texture = useMemo(
    () => new THREE.TextureLoader().load("/assets/photo-texture2.png"),
    [],
  );
  const material = useRef();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  useFrame(() => {
    if (material.current)
      material.current.uniforms.uLight.value.copy(lightRef.current);
  });

  return (
    <group position={[0, 0.02, -0.02]} rotation={[0, -0.08, 0]}>
      <mesh castShadow receiveShadow>
        <planeGeometry args={[1.12, 1.78, 96, 96]} />
        <shaderMaterial
          ref={material}
          transparent={false}
          side={THREE.DoubleSide}
          uniforms={{
            uMap: { value: texture },
            uLight: { value: lightRef.current.clone() },
          }}
          vertexShader={`
            varying vec2 vUv;
            varying vec3 vWorld;
            void main() {
              vUv = uv;
              vec4 world = modelMatrix * vec4(position, 1.0);
              vWorld = world.xyz;
              gl_Position = projectionMatrix * viewMatrix * world;
            }
          `}
          fragmentShader={`
            uniform sampler2D uMap;
            uniform vec3 uLight;
            varying vec2 vUv;
            varying vec3 vWorld;

            void main() {
              vec3 tex = texture2D(uMap, vUv).rgb;
              vec3 toLight = normalize(uLight - vWorld);
              float lambert = clamp(dot(toLight, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
              vec2 lightUv = vec2(0.5 - uLight.x * 0.16, 0.52 + uLight.y * 0.18);
              float spot = 1.0 - smoothstep(0.0, 0.78, distance(vUv, lightUv));
              float sweep = smoothstep(-2.35, 2.35, uLight.x) * (1.0 - vUv.x) + (1.0 - smoothstep(-2.35, 2.35, uLight.x)) * vUv.x;
              vec3 lit = tex * (0.58 + lambert * 0.52 + spot * 0.82 + sweep * 0.18);
              vec3 coolShadow = vec3(0.035, 0.045, 0.05) * (1.0 - spot) * 0.45;
              gl_FragColor = vec4(lit + coolShadow, 1.0);
            }
          `}
        />
      </mesh>
      <mesh position={[0, 0, -0.018]}>
        <boxGeometry args={[1.16, 1.82, 0.035]} />
        <meshStandardMaterial
          color="#111111"
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}

function Scene() {
  const lightRef = useRef(sphericalPoint(-45, 146));
  const snapAnimation = useRef(null);
  const spotTarget = useRef();
  const spotLight = useRef();
  const { camera } = useThree();

  const settleLight = () => {
    const target = closestSnap(lightRef.current);
    if (lightRef.current.distanceTo(target) < 0.002) return;

    snapAnimation.current = {
      from: lightRef.current.clone(),
      to: target,
      elapsed: 0,
      duration: 0.42,
    };
  };

  const dragHandlers = useLightDrag(lightRef, settleLight);

  useFrame((_, delta) => {
    camera.lookAt(0, 0.05, 0);
    if (spotLight.current) spotLight.current.position.copy(lightRef.current);

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
    }
  });

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
        color="#ffffff"
        intensity={24}
        angle={0.34}
        penumbra={0.75}
        distance={6}
      />
      <object3D ref={spotTarget} position={TARGET} />

      <GlassSphere lightRef={lightRef} dragHandlers={dragHandlers} />
      <Beam lightRef={lightRef} />
      <LightHandle lightRef={lightRef} dragHandlers={dragHandlers} />
      <PhotoPlane lightRef={lightRef} />

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

function App() {
  return (
    <main className="stage">
      <div className="viewport-card">
        <Canvas
          camera={{ position: [0, 0.12, 8.65], fov: 34 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          dpr={[1, 1.5]}
        >
          <Scene />
        </Canvas>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
