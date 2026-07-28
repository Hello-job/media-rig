import { lazy, type LazyExoticComponent, type ComponentType } from "react";
import directorStageSource from "./pages/DirectorStagePreview.tsx?raw";
import imageAngleRigSource from "./pages/ImageAngleRigPreview.tsx?raw";
import imageEditorSource from "./pages/ImageEditorPreview.tsx?raw";
import lightSphereSource from "./pages/LightSpherePreview.tsx?raw";

export type ComponentStatus = "Stable" | "Beta";

export type ComponentApiProp = {
  name: string;
  type: string;
  defaultValue: string;
  description: string;
};

export type MediaComponentMeta = {
  slug: "light-sphere" | "image-angle-rig" | "director-stage" | "image-editor";
  legacyDemo: "light" | "angle" | "director" | "editor";
  title: string;
  eyebrow: string;
  category: "Image" | "Lighting" | "Scene" | "Editor";
  status: ComponentStatus;
  description: string;
  summary: string;
  packagePath: string;
  registryName: string;
  dependencies: string[];
  tags: string[];
  previewClassName: string;
  stageClassName: string;
  source: string;
  preview: LazyExoticComponent<ComponentType>;
  api: ComponentApiProp[];
};

const LightSpherePreview = lazy(() => import("./pages/LightSpherePreview"));
const ImageAngleRigPreview = lazy(() => import("./pages/ImageAngleRigPreview"));
const DirectorStagePreview = lazy(() => import("./pages/DirectorStagePreview"));
const ImageEditorPreview = lazy(() => import("./pages/ImageEditorPreview"));

export const mediaComponents: MediaComponentMeta[] = [
  {
    slug: "image-editor",
    legacyDemo: "editor",
    title: "Image Editor",
    eyebrow: "Canvas editing",
    category: "Editor",
    status: "Beta",
    description: "集成图片导入、裁剪、绘制、擦除、图形、文本、图层与导出的深色画布编辑器。",
    summary: "面向媒体工作流的可嵌入式图片编辑工作台。",
    packagePath: "media-rig/image-editor",
    registryName: "image-editor",
    dependencies: ["fabric", "lucide-react"],
    tags: ["Canvas", "Crop", "Paint", "Layers"],
    previewClassName: "max-w-[1240px]",
    stageClassName: "h-[720px] bg-[#0b0b0d] max-[900px]:h-[820px]",
    source: imageEditorSource,
    preview: ImageEditorPreview,
    api: [
      { name: "initialDocument", type: "ImageEditorDocument", defaultValue: "空白画布", description: "初始化画布、对象和图层。" },
      { name: "storageKey", type: "string | false", defaultValue: "false", description: "启用本地文档持久化。" },
      { name: "onChange", type: "(document) => void", defaultValue: "undefined", description: "编辑文档变化时触发。" },
      { name: "onExport", type: "(blob) => void", defaultValue: "undefined", description: "完成图片导出时触发。" },
      { name: "onError", type: "(error) => void", defaultValue: "undefined", description: "导入、画布或导出失败时触发。" },
    ],
  },
  {
    slug: "image-angle-rig",
    legacyDemo: "angle",
    title: "Image Angle Rig",
    eyebrow: "Perspective control",
    category: "Image",
    status: "Stable",
    description: "把图片安装在圆角实体方块上，通过拖拽和参数精确控制旋转、倾斜与整体缩放。",
    summary: "用于商品图、封面和视觉素材的多角度构图控制器。",
    packagePath: "media-rig/image-angle-rig",
    registryName: "image-angle-rig",
    dependencies: ["@react-three/fiber", "@react-three/drei", "three", "lucide-react"],
    tags: ["Drag", "WebGL", "Controlled"],
    previewClassName: "max-w-[1040px]",
    stageClassName: "h-[560px] bg-[#090a0b] p-5 max-[760px]:h-[760px] max-[760px]:p-3",
    source: imageAngleRigSource,
    preview: ImageAngleRigPreview,
    api: [
      { name: "imageUrl", type: "string", defaultValue: '"/assets/photo-texture2.png"', description: "正面展示的图片地址。" },
      { name: "value", type: "Partial<ImageAngleState>", defaultValue: "undefined", description: "受控角度、倾斜和缩放状态。" },
      { name: "onChange", type: "(value) => void", defaultValue: "undefined", description: "拖拽或参数变化时触发。" },
      { name: "actionButton", type: "ComponentType", defaultValue: "内置按钮", description: "右下角自定义操作按钮。" },
      { name: "dragAxisLockThreshold", type: "number", defaultValue: "8", description: "手势参与轴向判断前的像素阈值。" },
    ],
  },
  {
    slug: "light-sphere",
    legacyDemo: "light",
    title: "Light Sphere",
    eyebrow: "Lighting direction",
    category: "Lighting",
    status: "Stable",
    description: "通过球面灯位、色温、强度和光束参数，为图片建立可视化布光方案。",
    summary: "面向摄影、海报和生成式图片工作流的交互式布光组件。",
    packagePath: "media-rig/light-sphere",
    registryName: "light-sphere",
    dependencies: ["@react-three/fiber", "@react-three/drei", "three"],
    tags: ["Lighting", "WebGL", "Temperature"],
    previewClassName: "max-w-[960px]",
    stageClassName: "h-[520px] bg-[#141414] max-[760px]:h-[720px]",
    source: lightSphereSource,
    preview: LightSpherePreview,
    api: [
      { name: "imageUrl", type: "string", defaultValue: "required", description: "接受布光预览的图片地址。" },
      { name: "color", type: "string", defaultValue: '"#ffffff"', description: "灯光颜色。" },
      { name: "intensity", type: "number", defaultValue: "0.5", description: "主灯强度。" },
      { name: "viewMode", type: '"front" | "perspective"', defaultValue: '"front"', description: "预览摄影机视角。" },
      { name: "targetPosition", type: "Vector3Like", defaultValue: "undefined", description: "外部控制的球面灯位。" },
    ],
  },
  {
    slug: "director-stage",
    legacyDemo: "director",
    title: "Director Stage",
    eyebrow: "Scene composition",
    category: "Scene",
    status: "Beta",
    description: "在同一个 3D 工作台中组织角色、道具、摄影机与构图，快速搭建镜头关系。",
    summary: "适合分镜、姿态预演与生成式视频前期编排的导演台。",
    packagePath: "media-rig/director-stage",
    registryName: "director-stage",
    dependencies: ["@react-three/fiber", "@react-three/drei", "three", "lucide-react"],
    tags: ["Scene", "Camera", "Transform"],
    previewClassName: "max-w-[1240px]",
    stageClassName: "h-[680px] bg-[#fbfbfa] max-[1180px]:h-[760px] max-[760px]:h-[920px]",
    source: directorStageSource,
    preview: DirectorStagePreview,
    api: [
      { name: "defaultComposition", type: "DirectorComposition", defaultValue: "内置场景", description: "初始化角色、道具和摄影机。" },
      { name: "onChange", type: "(composition) => void", defaultValue: "undefined", description: "场景编排变化时触发。" },
      { name: "selectedId", type: "string", defaultValue: "undefined", description: "受控选中对象。" },
      { name: "onExport", type: "(composition) => void", defaultValue: "undefined", description: "导出场景数据时触发。" },
      { name: "style", type: "CSSProperties", defaultValue: "undefined", description: "根容器尺寸样式。" },
    ],
  },
];

export function findComponent(slug: string | null) {
  return mediaComponents.find((component) => component.slug === slug);
}

export function resolveComponentFromLocation(search: string, pathname = "") {
  const routeMatch = pathname.match(/^\/components\/([^/]+)\/?$/);
  if (routeMatch) return findComponent(decodeURIComponent(routeMatch[1]));

  const params = new URLSearchParams(search);
  const slug = params.get("component");
  if (slug) return findComponent(slug);

  const legacyDemo = params.get("demo");
  return mediaComponents.find((component) => component.legacyDemo === legacyDemo);
}

export function componentHref(slug: MediaComponentMeta["slug"]) {
  return `/components/${slug}`;
}
