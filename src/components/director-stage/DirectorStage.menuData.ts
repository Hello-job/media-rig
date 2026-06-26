import type { DirectorCamera, DirectorPropType } from "./DirectorStage.types";

export const CAMERA_PRESETS: Array<{ label: string; camera: Partial<DirectorCamera> }> = [
  { label: "正面中景", camera: { position: { x: 0, y: 1.75, z: 4.6 }, lookAt: { x: 0, y: 1.15, z: -0.2 }, fov: 50 } },
  { label: "正面特写", camera: { position: { x: 0.2, y: 1.55, z: 2.6 }, lookAt: { x: 0, y: 1.25, z: -0.2 }, fov: 38 } },
  { label: "正面全景", camera: { position: { x: 0.6, y: 2.1, z: 7.0 }, lookAt: { x: 0, y: 1.0, z: -0.6 }, fov: 58 } },
  { label: "侧面跟拍", camera: { position: { x: 4.6, y: 1.7, z: 0.6 }, lookAt: { x: 0, y: 1.1, z: -0.5 }, fov: 48 } },
  { label: "侧面近景", camera: { position: { x: 2.7, y: 1.45, z: 0.4 }, lookAt: { x: 0, y: 1.2, z: -0.4 }, fov: 42 } },
  { label: "背面中景", camera: { position: { x: 0, y: 1.8, z: -5.4 }, lookAt: { x: 0, y: 1.1, z: -0.6 }, fov: 50 } },
  { label: "俯拍全景", camera: { position: { x: 2.8, y: 5.4, z: 4.0 }, lookAt: { x: 0, y: 0.6, z: -0.5 }, fov: 52 } },
  { label: "45°俯拍", camera: { position: { x: 3.8, y: 3.6, z: 4.8 }, lookAt: { x: 0, y: 0.9, z: -0.5 }, fov: 48 } },
];

export const GEOMETRY_PROPS: Array<{ label: string; type: DirectorPropType; mark: string }> = [
  { label: "立方体", type: "cube", mark: "□" },
  { label: "球体", type: "sphere", mark: "○" },
  { label: "圆柱体", type: "cylinder", mark: "▭" },
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
];
