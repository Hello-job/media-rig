import { CatmullRomCurve3, Vector3 } from "three";
import type { DirectorCamera, DirectorCameraMotion } from "./DirectorStage.types";

export function sampleCameraMotion(motion: DirectorCameraMotion, time: number): DirectorCamera {
  const t = Math.max(0, Math.min(1, (time - motion.start) / motion.duration));
  const points = motion.points.map((point) => new Vector3(...point));
  const position = points.length === 2 ? points[0].clone().lerp(points[1], t) : new CatmullRomCurve3(points, false, "centripetal").getPoint(t);
  const { camera } = motion;
  const target = new Vector3(camera.lookAt.x, camera.lookAt.y, camera.lookAt.z);
  const originalDistance = new Vector3(camera.position.x, camera.position.y, camera.position.z).distanceTo(target);
  const fov = motion.preset === "dolly-zoom" ? 2 * Math.atan(Math.tan(camera.fov * Math.PI / 360) * originalDistance / Math.max(0.1, position.distanceTo(target))) * 180 / Math.PI : camera.fov;
  return { ...camera, id: motion.cameraId, position: { x: position.x, y: position.y, z: position.z }, fov: Math.max(5, Math.min(150, fov)) };
}
