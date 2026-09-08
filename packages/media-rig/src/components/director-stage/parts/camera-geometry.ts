export type CameraWirePoint = [number, number, number];

export type CameraWireLine = {
  part: "body" | "lens" | "reel";
  points: CameraWirePoint[];
};

const CAMERA_HIT_PADDING = 0.06;
const CAMERA_ASPECT = 16 / 9;
const CAMERA_FRUSTUM_DEPTH = 1.72;
const CAMERA_FRUSTUM_FRAME_WIDTH = 1.08;
const CAMERA_BODY_CENTER: CameraWirePoint = [0, 0, -0.18];
const CAMERA_BODY_SIZE: CameraWirePoint = [0.52, 0.66, 0.56];
const CAMERA_BODY_FRONT_Z = CAMERA_BODY_CENTER[2] + CAMERA_BODY_SIZE[2] / 2;
const CAMERA_LENS_TIP: CameraWirePoint = [0, 0, 0.32];

function createBoxLines(
  center: CameraWirePoint,
  size: CameraWirePoint,
): CameraWirePoint[][] {
  const [cx, cy, cz] = center;
  const [width, height, depth] = size;
  const x0 = cx - width / 2;
  const x1 = cx + width / 2;
  const y0 = cy - height / 2;
  const y1 = cy + height / 2;
  const z0 = cz - depth / 2;
  const z1 = cz + depth / 2;
  const corners = {
    bbl: [x0, y0, z0] as CameraWirePoint,
    bbr: [x1, y0, z0] as CameraWirePoint,
    btl: [x0, y1, z0] as CameraWirePoint,
    btr: [x1, y1, z0] as CameraWirePoint,
    fbl: [x0, y0, z1] as CameraWirePoint,
    fbr: [x1, y0, z1] as CameraWirePoint,
    ftl: [x0, y1, z1] as CameraWirePoint,
    ftr: [x1, y1, z1] as CameraWirePoint,
  };

  return [
    [corners.bbl, corners.bbr, corners.btr, corners.btl, corners.bbl],
    [corners.fbl, corners.fbr, corners.ftr, corners.ftl, corners.fbl],
    [corners.bbl, corners.fbl],
    [corners.bbr, corners.fbr],
    [corners.btr, corners.ftr],
    [corners.btl, corners.ftl],
  ];
}

function createLensLines(): CameraWirePoint[][] {
  const back: CameraWirePoint[] = [
    [-0.1, 0.1, CAMERA_BODY_FRONT_Z],
    [0.1, 0.1, CAMERA_BODY_FRONT_Z],
    [0.1, -0.1, CAMERA_BODY_FRONT_Z],
    [-0.1, -0.1, CAMERA_BODY_FRONT_Z],
  ];
  const front: CameraWirePoint[] = [
    [-0.13, 0.13, CAMERA_LENS_TIP[2]],
    [0.13, 0.13, CAMERA_LENS_TIP[2]],
    [0.13, -0.13, CAMERA_LENS_TIP[2]],
    [-0.13, -0.13, CAMERA_LENS_TIP[2]],
  ];

  return [
    [...back, back[0]],
    [...front, front[0]],
    ...back.map((point, index) => [point, front[index]]),
  ];
}

function createReelLine(centerZ: number): CameraWirePoint[] {
  const segments = 32;
  const radius = 0.1;
  const centerY = 0.18;

  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / segments;
    return [
      0,
      centerY + Math.cos(angle) * radius,
      centerZ + Math.sin(angle) * radius,
    ];
  });
}

export function getCameraBodyLines(): CameraWireLine[] {
  return [
    ...createBoxLines(CAMERA_BODY_CENTER, CAMERA_BODY_SIZE).map((points) => ({
      part: "body" as const,
      points,
    })),
    ...createLensLines().map((points) => ({
      part: "lens" as const,
      points,
    })),
    {
      part: "reel",
      points: createReelLine(-0.3),
    },
    {
      part: "reel",
      points: createReelLine(-0.08),
    },
  ];
}

export function getCameraFrustumLines(): CameraWirePoint[][] {
  const halfWidth = CAMERA_FRUSTUM_FRAME_WIDTH / 2;
  const halfHeight = CAMERA_FRUSTUM_FRAME_WIDTH / CAMERA_ASPECT / 2;
  const corners: CameraWirePoint[] = [
    [-halfWidth, halfHeight, CAMERA_FRUSTUM_DEPTH],
    [halfWidth, halfHeight, CAMERA_FRUSTUM_DEPTH],
    [halfWidth, -halfHeight, CAMERA_FRUSTUM_DEPTH],
    [-halfWidth, -halfHeight, CAMERA_FRUSTUM_DEPTH],
  ];

  return [
    ...corners.map((corner) => [CAMERA_LENS_TIP, corner]),
    [corners[0], corners[1], corners[2], corners[3], corners[0]],
  ];
}

export function getCameraHitArea() {
  const points = getCameraBodyLines().flatMap((line) => line.points);
  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  const zs = points.map((point) => point[2]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);

  return {
    args: [
      maxX - minX + CAMERA_HIT_PADDING * 2,
      maxY - minY + CAMERA_HIT_PADDING * 2,
      maxZ - minZ + CAMERA_HIT_PADDING * 2,
    ] as CameraWirePoint,
    position: [
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2,
    ] as CameraWirePoint,
  };
}
