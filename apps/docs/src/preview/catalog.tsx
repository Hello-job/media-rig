import { lazy, type LazyExoticComponent, type ComponentType } from "react";
import directorStageSource from "./pages/DirectorStagePreview.tsx?raw";
import imageAngleRigSource from "./pages/ImageAngleRigPreview.tsx?raw";
import imageEditorSource from "./pages/ImageEditorPreview.tsx?raw";
import layerSeparatorSource from "./pages/LayerSeparatorPreview.tsx?raw";
import imageAnnotationSource from "./pages/ImageAnnotationPreview.tsx?raw";
import lightSphereSource from "./pages/LightSpherePreview.tsx?raw";

export type ComponentStatus = "Stable" | "Beta";

export type ComponentApiProp = {
  name: string;
  type: string;
  defaultValue: string;
  description: string;
};

export type MediaComponentMeta = {
  slug: "image-annotation" | "light-sphere" | "image-angle-rig" | "director-stage" | "image-editor" | "layer-separator";
  legacyDemo: "annotation" | "light" | "angle" | "director" | "editor" | "layers";
  title: string;
  eyebrow: string;
  category: "Image" | "Lighting" | "Scene" | "Editor";
  status: ComponentStatus;
  description: string;
  summary: string;
  packagePath: string;
  exportName?: string;
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
const LayerSeparatorPreview = lazy(() => import("./pages/LayerSeparatorPreview"));

const ImageAnnotationPreview = lazy(() => import("./pages/ImageAnnotationPreview"));

export const mediaComponents: MediaComponentMeta[] = [
  {
    slug: "image-annotation", legacyDemo: "annotation", title: "Image Annotation",
    eyebrow: "Draw on images", category: "Image", status: "Stable",
    description: "轻量图片涂鸦组件，支持画笔、矩形、文字、选择变换、撤销重做与原尺寸 PNG 合成导出。",
    summary: "在图片上画出想法，标记重点，再保存为完整图片。",
    packagePath: "media-rig/image-annotation", registryName: "image-annotation",
    dependencies: ["fabric", "lucide-react"], tags: ["Brush", "Text", "Annotation", "Export"],
    previewClassName: "max-w-[1180px]", stageClassName: "min-h-[600px] bg-[#090a0b] p-5 max-[520px]:p-0",
    source: imageAnnotationSource, preview: ImageAnnotationPreview,
    api: [
      { name: "imageUrl", type: "string", defaultValue: "required", description: "原图地址；更换后重置画布与历史。跨域图片需支持 CORS。" },
      { name: "imageAlt", type: "string", defaultValue: "待涂鸦图片", description: "原图的替代文本。" },
      { name: "onSave", type: "(image: Blob) => void | Promise<void>", defaultValue: "undefined", description: "接收原图尺寸的 PNG 合成结果，由宿主下载或上传。" },
      { name: "onCancel", type: "() => void", defaultValue: "undefined", description: "显示退出按钮，并响应 Escape。" },
      { name: "onError", type: "(error: Error) => void", defaultValue: "undefined", description: "图片加载、画布初始化和保存失败回调。" },
    ],
  },
  {
    slug: "layer-separator",
    legacyDemo: "layers",
    title: "Layer Separator",
    eyebrow: "AI layer decomposition",
    category: "Image",
    status: "Beta",
    description: "提供框选提示、自动拆分、异步进度和分离结果编排的图层分离工作台；模型请求由宿主应用接入。",
    summary: "把单张图片拆成可独立移动、旋转、翻转和合并的透明图层。",
    packagePath: "media-rig/layer-separator",
    registryName: "layer-separator",
    dependencies: ["lucide-react"],
    tags: ["Layers", "Selection", "Async", "Composition"],
    previewClassName: "max-w-[1180px]",
    stageClassName: "h-[680px] bg-[#090a0b] p-5 max-[780px]:h-[900px] max-[520px]:p-0",
    source: layerSeparatorSource,
    preview: LayerSeparatorPreview,
    api: [
      { name: "imageUrl", type: "string", defaultValue: "required", description: "等待拆分的源图片地址。" },
      { name: "onSeparate", type: "(request) => Promise<result>", defaultValue: "undefined", description: "接入任意图层分离服务，并返回背景与透明图层。" },
      { name: "result", type: "LayerSeparatorResult | null", defaultValue: "undefined", description: "受控的分层结果与图层变换。" },
      { name: "onResultChange", type: "(result) => void", defaultValue: "undefined", description: "移动、旋转、翻转或显隐图层时触发。" },
      { name: "onMerge", type: "(blob, result) => void", defaultValue: "undefined", description: "浏览器合成 PNG 后触发。" },
      { name: "locale", type: '"zh-CN" | "en-US"', defaultValue: '"zh-CN"', description: "内置界面语言。" },
    ],
  },
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
    description: "在整块预览区拖拽调整水平旋转与垂直倾斜，通过整数滑杆控制角度和镜头推进。",
    summary: "用于商品图、封面和视觉素材的多角度构图控制器。",
    packagePath: "media-rig/image-angle-rig",
    registryName: "image-angle-rig",
    dependencies: ["lucide-react"],
    tags: ["Drag", "CSS 3D", "Controlled"],
    previewClassName: "max-w-[1040px]",
    stageClassName: "h-[420px] bg-[#090a0b] p-5 max-[480px]:h-[620px] max-[480px]:p-3",
    source: imageAngleRigSource,
    preview: ImageAngleRigPreview,
    api: [
      { name: "imageUrl", type: "string", defaultValue: '"/assets/photo-texture2.png"', description: "正面展示的图片地址。" },
      { name: "value", type: "Partial<ImageAngleState>", defaultValue: "undefined", description: "受控角度、倾斜和缩放状态。" },
      { name: "onChange", type: "(value) => void", defaultValue: "undefined", description: "拖拽或参数变化时触发。" },
      { name: "actionButton", type: "ComponentType", defaultValue: "内置按钮", description: "右下角自定义操作按钮。" },
      { name: "defaultValue", type: "Partial<ImageAngleState>", defaultValue: "{ yaw: 30, pitch: -20, zoom: 0, wideAngle: false }", description: "初始状态；重置恢复内置默认值。" },
      { name: "onChangeEnd", type: "(value) => void", defaultValue: "undefined", description: "拖拽或滑杆操作结束、切换广角、重置时提交参数。" },
      { name: "dragThreshold", type: "number", defaultValue: "3", description: "拖拽启动距离（像素）；按预览区尺寸映射角度，不锁轴。" },
      { name: "dragAxisLockThreshold", type: "number", defaultValue: "undefined", description: "已弃用，保留为 dragThreshold 的兼容别名。" },
      { name: "actionLoading", type: "boolean", defaultValue: "false", description: "操作处理中，显示加载状态并阻止重复触发。" },
      { name: "actionDisabled", type: "boolean", defaultValue: "false", description: "禁用操作按钮。" },
      { name: "onClose", type: "() => void", defaultValue: "undefined", description: "提供时显示关闭按钮，由宿主管理显隐。" },
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
    exportName: "LightSpherePanel",
    registryName: "light-sphere",
    dependencies: ["@react-three/fiber", "@react-three/drei", "three", "lucide-react"],
    tags: ["Lighting", "WebGL", "Temperature"],
    previewClassName: "max-w-[960px]",
    stageClassName: "h-[420px] bg-[#090a0b] p-5 max-[480px]:h-[660px] max-[480px]:p-3",
    source: lightSphereSource,
    preview: LightSpherePreview,
    api: [
      { name: "imageUrl", type: "string", defaultValue: '"/assets/photo-texture2.png"', description: "LightSpherePanel 与 LightSphere 的预览图片。" },
      { name: "value / defaultValue", type: "Partial<LightSpherePanelValue>", defaultValue: "50% · 5600K · 前方 · 透视 · 轮廓光开启", description: "面板的受控状态或初始状态。" },
      { name: "onChange", type: "(value) => void", defaultValue: "undefined", description: "滑杆、视角、方向预设、轮廓光和拖拽灯位的状态更新。" },
      { name: "onChangeEnd", type: "(value) => void", defaultValue: "undefined", description: "调节完成后提交完整状态。" },
      { name: "onClose", type: "() => void", defaultValue: "undefined", description: "提供时显示关闭按钮。" },
      { name: "onAction", type: "({ value, input }, event) => void", defaultValue: "undefined", description: "应用当前打光方案；轮廓光作为输出参数传递。" },
      { name: "actionButton", type: "ComponentType<LightSphereActionButtonProps>", defaultValue: "内置按钮", description: "可注入自定义操作按钮，接收 value、input、disabled 和 loading。" },
      { name: "actionLoading / actionDisabled", type: "boolean", defaultValue: "false", description: "处理中状态和禁用状态。" },
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
    stageClassName: "h-[680px] bg-[#121212] max-[1180px]:h-[760px] max-[760px]:h-[920px]",
    source: directorStageSource,
    preview: DirectorStagePreview,
    api: [
      { name: "initialComposition", type: "Partial<DirectorComposition>", defaultValue: "内置场景", description: "初始化角色、道具和摄影机。" },
      { name: "onCompositionChange", type: "(composition) => void", defaultValue: "undefined", description: "场景编排变化时触发。" },
      { name: "storageKey", type: "string | false", defaultValue: "内置存储键", description: "本地草稿键；false 关闭持久化。" },
      { name: "onCapture", type: "(dataUrl: string) => void", defaultValue: "undefined", description: "按选定画幅截图时触发。" },
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
