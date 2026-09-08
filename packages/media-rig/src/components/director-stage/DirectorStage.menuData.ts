import type { DirectorCamera, DirectorPropType } from "./DirectorStage.types";

export const CAMERA_PRESETS: Array<{ label: string; camera: Partial<DirectorCamera> }> = [
  { label: "正面中景", camera: { position: { x: 0, y: 2.1, z: 5 }, lookAt: { x: 0, y: 1.15, z: 0 }, fov: 42 } },
  { label: "正面特写", camera: { position: { x: 0, y: 1.8, z: 3 }, lookAt: { x: 0, y: 1.5, z: 0 }, fov: 32 } },
  { label: "正面全景", camera: { position: { x: 0, y: 2.7, z: 9 }, lookAt: { x: 0, y: 1, z: 0 }, fov: 50 } },
  { label: "侧面跟拍", camera: { position: { x: 5, y: 1.9, z: 0 }, lookAt: { x: 0, y: 1.15, z: 0 }, fov: 42 } },
  { label: "侧面远景", camera: { position: { x: 10, y: 3.2, z: 0 }, lookAt: { x: 0, y: 1, z: 0 }, fov: 52 } },
  { label: "背面中景", camera: { position: { x: 0, y: 2.1, z: -5 }, lookAt: { x: 0, y: 1.15, z: 0 }, fov: 42 } },
  { label: "俯拍全景", camera: { position: { x: 0, y: 10, z: 2.5 }, lookAt: { x: 0, y: 0.6, z: 0 }, fov: 52 } },
  { label: "45° 俯拍", camera: { position: { x: 5.8, y: 6.5, z: 5.8 }, lookAt: { x: 0, y: 0.8, z: 0 }, fov: 45 } },
  { label: "低角度仰拍", camera: { position: { x: 0, y: 0.4, z: 4.2 }, lookAt: { x: 0, y: 1.65, z: 0 }, fov: 38 } },
  { label: "低角度广角", camera: { position: { x: 0, y: 0.35, z: 6.5 }, lookAt: { x: 0, y: 1.55, z: 0 }, fov: 68 } },
  { label: "过肩镜头", camera: { position: { x: 1.3, y: 1.75, z: 2.25 }, lookAt: { x: -0.5, y: 1.3, z: 0 }, fov: 38 } },
  { label: "过肩镜头（右）", camera: { position: { x: -1.3, y: 1.75, z: 2.25 }, lookAt: { x: 0.5, y: 1.3, z: 0 }, fov: 38 } },
  { label: "鸟瞰", camera: { position: { x: 0, y: 14, z: 0.01 }, lookAt: { x: 0, y: 0, z: 0 }, fov: 50 } },
  { label: "荷兰角", camera: { position: { x: 4.2, y: 3.4, z: 5.5 }, lookAt: { x: 0, y: 1, z: 0 }, fov: 45, roll: -0.28 } },
];

export const GEOMETRY_PROPS: Array<{ label: string; type: DirectorPropType; mark: string }> = [
  { label: "立方体", type: "cube", mark: "□" },
  { label: "球体", type: "sphere", mark: "○" },
  { label: "圆柱体", type: "cylinder", mark: "▭" },
  { label: "柱体", type: "column", mark: "▥" },
  { label: "环状体", type: "torus", mark: "◎" },
  { label: "圆锥", type: "cone", mark: "△" },
  { label: "棱锥", type: "cone", mark: "◇" },
];

export const FURNITURE_PROPS: Array<{ label: string; type: DirectorPropType; mark: string }> = [
  { label: "椅子", type: "chair", mark: "♜" },
  { label: "沙发", type: "sofa", mark: "▰" },
  { label: "方桌", type: "table", mark: "◒" },
  { label: "圆桌", type: "roundTable", mark: "◉" },
  { label: "床", type: "bed", mark: "▱" },
  { label: "轿车", type: "car", mark: "▰" },
  { label: "木箱", type: "crate", mark: "▦" },
  { label: "落地灯", type: "floor-lamp", mark: "♧" },
];
