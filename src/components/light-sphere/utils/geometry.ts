import * as THREE from "three";

export type RingAxis = "x" | "y" | "z";
export type Point3Tuple = [number, number, number];

export function sphericalPoint(
  latDeg: number,
  lonDeg: number,
  radius: number,
): THREE.Vector3 {
  const lat = THREE.MathUtils.degToRad(latDeg);
  const lon = THREE.MathUtils.degToRad(lonDeg);
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.cos(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.sin(lon),
  );
}

export function makeRing(
  axis: RingAxis,
  angleDeg: number,
  radius: number,
): Point3Tuple[] {
  const points: Point3Tuple[] = [];
  const r = radius * Math.cos(THREE.MathUtils.degToRad(angleDeg));
  const offset = radius * Math.sin(THREE.MathUtils.degToRad(angleDeg));

  for (let i = 0; i <= 160; i += 1) {
    const a = (i / 160) * Math.PI * 2;
    if (axis === "y") points.push([Math.cos(a) * r, offset, Math.sin(a) * r]);
    if (axis === "x") points.push([offset, Math.cos(a) * r, Math.sin(a) * r]);
    if (axis === "z") points.push([Math.cos(a) * r, Math.sin(a) * r, offset]);
  }
  return points;
}

export function makeLatitude(latDeg: number, radius: number): Point3Tuple[] {
  const points: Point3Tuple[] = [];
  for (let i = 0; i <= 140; i += 1) {
    const lon = (i / 140) * 180;
    const point = sphericalPoint(latDeg, lon, radius + 0.012);
    points.push([point.x, point.y, point.z]);
  }
  return points;
}

export function makeMeridian(lonDeg: number, radius: number): Point3Tuple[] {
  const points: Point3Tuple[] = [];
  for (let i = 0; i <= 140; i += 1) {
    const lat = -78 + (i / 140) * 156;
    const point = sphericalPoint(lat, lonDeg, radius + 0.014);
    points.push([point.x, point.y, point.z]);
  }
  return points;
}

export function generateSnapPoints(radius: number): THREE.Vector3[] {
  return [
    ...[-54, -27, 0, 27, 54].flatMap((lat) =>
      [34, 62, 90, 118, 146].map((lon) => sphericalPoint(lat, lon, radius)),
    ),
    sphericalPoint(90, 0, radius),
    sphericalPoint(-90, 0, radius),
    sphericalPoint(0, 10, radius),
    sphericalPoint(0, 170, radius),
  ];
}

export function closestSnap(
  point: THREE.Vector3,
  snapPoints: THREE.Vector3[],
): THREE.Vector3 {
  let nearest = point;
  let bestDistance = Infinity;

  for (const snapPoint of snapPoints) {
    const distance = point.distanceTo(snapPoint);
    if (distance < bestDistance) {
      bestDistance = distance;
      nearest = snapPoint;
    }
  }

  if (bestDistance > 1.2) return point.clone();
  return nearest.clone();
}
