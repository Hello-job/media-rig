# MediaRig

中文 | [English](./README.en.md)

MediaRig 是一个面向图片编辑、视觉参数调整和三维场景编排的 React 组件库。它将常见的媒体交互封装为可复用组件，提供 TypeScript 类型、在线演示，以及 npm 包和 shadcn Registry 两种接入方式。

[在线演示与文档](https://media-rig.vercel.app/) · [组件源码](./packages/media-rig/src/components) · [反馈问题](https://github.com/Hello-job/media-rig/issues)

## 组件目录

目前提供六组组件：

| 组件 | 用途 | 在线演示 |
| --- | --- | --- |
| `LightSphere` / `LightSpherePanel` | 球面灯位预览，以及亮度、色温、方向和轮廓光参数配置 | [图片布光](https://media-rig.vercel.app/components/light-sphere) |
| `ImageAngleRig` | 图片水平旋转、垂直倾斜、镜头推进和广角参数配置 | [图片视角](https://media-rig.vercel.app/components/image-angle-rig) |
| `DirectorStage` | 角色与道具摆放、相机配置、运镜时间轴和画面捕获 | [3D 导演台](https://media-rig.vercel.app/components/director-stage) |
| `ImageEditor` | 图片、文字、图形、涂绘、裁剪、图层管理和文档保存 | [图片编辑器](https://media-rig.vercel.app/components/image-editor) |
| `ImageAnnotation` | 在原图上添加画笔、矩形和文字标注，合成导出 PNG | [图片涂鸦](https://media-rig.vercel.app/components/image-annotation) |
| `LayerSeparator` | 框选主体、请求图层分离，以及透明图层的变换与合成 | [图层分离](https://media-rig.vercel.app/components/layer-separator) |

`ImageEditor` 适合完整的图片编辑工作流；`ImageAnnotation` 适合嵌入已有页面，对单张图片进行轻量标注。

布光、视角调整和图层分离组件通过回调输出参数或请求。AI 模型调用、图片上传和业务数据保存由宿主应用接入。在线图层分离演示使用预置素材，并未连接在线分割模型。

## 安装

### 包安装（pnpm）

在 React 项目中安装组件包：

```bash
pnpm add media-rig
```

当前包声明了 React、React DOM、Three.js、React Three Fiber、Drei 和 Fabric.js 为 peer dependencies。请根据现有项目选择相互兼容的版本；本仓库使用 React 19、Fiber 9、Drei 10、Three.js 0.168 和 Fabric.js 7。

以下命令适用于采用本仓库版本组合的新项目：

```bash
pnpm add media-rig react@^19 react-dom@^19 three@^0.168 @react-three/fiber@^9 @react-three/drei@^10 fabric@^7
```

在应用入口引入样式，并按组件子路径导入：

```tsx
import "media-rig/style.css";
import { ImageAnnotation } from "media-rig/image-annotation";
```

六组组件的导入路径分别为 `media-rig/light-sphere`、`media-rig/image-angle-rig`、`media-rig/director-stage`、`media-rig/image-editor`、`media-rig/image-annotation` 和 `media-rig/layer-separator`。也可以从 `media-rig` 统一导入。

### MediaRig CLI

项目已提供 `media-rig` CLI 入口，复用 shadcn 安装源码、样式与依赖。**npm 上当前的旧版本还没有 CLI；以下短命令需发布包含 CLI 的新版后才能使用。** 发布前可在本仓库通过 `pnpm cli` 测试。

```bash
# 新版发布后的调用方式
npx media-rig@latest init
npx media-rig@latest list
npx media-rig@latest add image-annotation
pnpm dlx media-rig@latest add light-sphere director-stage
```

```bash
# 本地开发，无需发布 npm
pnpm cli list
pnpm cli init --cwd /path/to/react-app
pnpm cli add image-annotation --cwd /path/to/react-app
pnpm cli add director-stage --cwd /path/to/react-app --dry-run
```

支持 `--cwd` / `-c` 指定项目、`--yes` / `-y` 跳过安装确认、`--overwrite` / `-o` 显式覆盖现有源码、`--dry-run` 只预览变更。默认不会强制覆盖文件。`init` 创建 shadcn 配置，已有 `components.json` 时直接 `add`。

CLI 需要 Node.js 22.12+ 和 npm/npx，会通过固定版本的 shadcn CLI 完成安装；安装过程需要联网，目标项目的依赖由 shadcn 按其包管理器处理。目标项目使用 React 19 / Tailwind CSS 4。pnpm 11 的 Fabric 原生构建及 Three.js 类型配置见下文。

维护者发布前运行 `pnpm --filter media-rig run test:cli`、`pnpm build:lib` 和 `pnpm --filter media-rig pack` 验证发布包，再以具有该 npm 包发布权限的账号执行 `pnpm --filter media-rig publish --access public`。发布成功之前，文档站继续提供已可用的 shadcn URL 命令。

### shadcn 源码

网站每个组件详情页都提供可复制的 shadcn CLI 命令，支持 pnpm、npm、yarn、bun，默认使用 pnpm。

在 React 19、Tailwind CSS 4 项目中使用。首次接入先运行 `pnpm dlx shadcn@latest init`，已有 `components.json` 的项目可跳过。然后选择需要的组件执行：

```bash
pnpm dlx shadcn@latest add https://media-rig.vercel.app/r/light-sphere.json
pnpm dlx shadcn@latest add https://media-rig.vercel.app/r/image-angle-rig.json
pnpm dlx shadcn@latest add https://media-rig.vercel.app/r/director-stage.json
pnpm dlx shadcn@latest add https://media-rig.vercel.app/r/image-editor.json
pnpm dlx shadcn@latest add https://media-rig.vercel.app/r/image-annotation.json
pnpm dlx shadcn@latest add https://media-rig.vercel.app/r/layer-separator.json
```

Registry 会安装当前组件的源码、样式和依赖，源码目标目录跟随 `components.json` 的 `components` 别名（例如 `src/components/<component-name>/`）。安装后使用 `import { ImageAnnotation } from "@/components/image-annotation"` 这样的本地路径导入，无需再安装 `media-rig` 包。具体文件和依赖见 [`registry.json`](./registry.json)。业务图片通过 `imageUrl` 等属性传入，不应依赖文档站的示例素材路径。

使用 pnpm 11 时，在项目的 `pnpm-workspace.yaml` 中合并以下配置，再执行安装命令。`canvas` 是 Fabric 的可选 Node 原生依赖，浏览器端不需要构建；统一 Three.js 类型可避免三维依赖带来的重复类型冲突。

```yaml
allowBuilds:
  canvas: false
overrides:
  '@types/three': '^0.168.0'
```

保留文件里的其他配置；已有 Three.js 项目需要先确认版本兼容性。

## 快速开始

下面是一个可直接使用的图片涂鸦示例。将图片放到应用的 `public/scene.png`，保存时会下载保留原图尺寸的 PNG 文件。

```tsx
import { ImageAnnotation } from "media-rig/image-annotation";
import "media-rig/style.css";

function downloadImage(image: Blob) {
  const url = URL.createObjectURL(image);
  const link = document.createElement("a");
  link.href = url;
  link.download = "annotated-image.png";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto" }}>
      <ImageAnnotation
        imageUrl="/scene.png"
        imageAlt="待标注的场景"
        onSave={downloadImage}
        onError={(error) => console.error(error)}
      />
    </div>
  );
}
```

组件支持画笔、矩形、可编辑文字、选择移动、缩放、旋转、颜色与粗细调节、删除、清空及撤销重做。`onSave` 支持异步回调；更换 `imageUrl` 会重置画布和历史。传入 `onCancel` 后显示退出按钮，并支持 Escape 退出。

## 其他组件用法

以下示例假设已在应用入口引入 `media-rig/style.css`。完整 API 与示例源码见各组件的在线文档。

### 图片布光

```tsx
import { LightSpherePanel } from "media-rig/light-sphere";

export default function LightingExample() {
  return (
    <LightSpherePanel
      imageUrl="/scene.png"
      onChange={(value) => console.log("当前布光参数", value)}
      onAction={({ value }) => console.log("应用布光方案", value)}
    />
  );
}
```

`LightSpherePanel` 集成球面预览和参数面板，支持 `value` / `defaultValue`、`onChange` 和 `onChangeEnd`。轮廓光是输出参数，不会在预览中增加第二个光源。如果只需要球面灯位交互，可单独使用 `LightSphere`。

### 图片视角

```tsx
import { ImageAngleRig } from "media-rig/image-angle-rig";

export default function AngleExample() {
  return (
    <ImageAngleRig
      imageUrl="/scene.png"
      defaultValue={{ yaw: 30, pitch: -20, zoom: 0, wideAngle: false }}
      onChangeEnd={(value) => console.log("调整完成", value)}
      onAction={({ value }) => console.log("应用视角参数", value)}
    />
  );
}
```

预览采用 CSS 3D。拖拽和滑杆通过 `onChange` 连续输出参数，结束操作时触发 `onChangeEnd`。广角开关作为输出参数使用，不改变预览视野。

### 3D 导演台

```tsx
import { DirectorStage } from "media-rig/director-stage";

export default function DirectorExample() {
  return (
    <div style={{ width: "100%", height: "90vh", minHeight: 680 }}>
      <DirectorStage
        storageKey="my-director-stage"
        onCompositionChange={(composition) => console.log(composition)}
        onCapture={(dataUrl) => console.log("捕获画面", dataUrl)}
      />
    </div>
  );
}
```

支持角色与道具管理、相机视角、对象变换、运镜预设及时间轴。可通过 `initialComposition` 设置初始场景，通过 `storageKey` 配置本地保存键；传入 `false` 可关闭本地持久化。

### 图片编辑器

```tsx
import { ImageEditor } from "media-rig/image-editor";

export default function EditorExample() {
  return (
    <div style={{ width: "100%", height: "90vh", minHeight: 680 }}>
      <ImageEditor
        storageKey="my-image-editor"
        onSave={(document) => console.log("编辑器文档", document)}
      />
    </div>
  );
}
```

`onSave` 返回编辑器文档，适合 JSON 持久化；图片导出通过 `onExport` 或组件 ref 的 `exportImage` 处理。`ImageEditorHandle` 还提供 `addImage`、`addText`、`loadDocument`、`getDocument`、`undo`、`redo` 和 `fitToViewport` 等方法。

### 图层分离

```tsx
import {
  LayerSeparator,
  type LayerSeparatorResult,
} from "media-rig/layer-separator";

export default function LayerExample() {
  return (
    <LayerSeparator
      imageUrl="/scene.png"
      aspectRatio={3 / 2}
      onSeparate={async (request) => {
        // 由宿主实现此接口，并按 LayerSeparatorResult 返回结果。
        const response = await fetch("/api/separate-layers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: "/scene.png", ...request }),
        });
        if (!response.ok) throw new Error("图层分离失败");
        return (await response.json()) as LayerSeparatorResult;
      }}
      onMerge={(image) => console.log("合成 PNG", image)}
    />
  );
}
```

`onSeparate` 接收选区、说明和生成的提示词，返回 `{ background, layers }`。物体图层使用透明图片 URL，可通过 `contentBounds` 描述主体范围，通过 `transform` 设置位置、缩放、旋转、翻转和显隐。框选列表会显示对应选区的缩略图。

### 接入说明

- 图片编辑器和导演台需要父容器提供明确的宽度与高度。
- Canvas、WebGL 和图片导出功能在浏览器运行；使用服务端渲染框架时，应在客户端组件中挂载这些交互组件。
- 需要合成或导出的跨域图片必须允许 CORS，否则浏览器无法读取像素。
- 保存、上传、生成和关闭操作通过回调交给宿主处理。示例中的服务接口需要自行实现。

## 本地开发

本仓库使用 Node.js 24 和 pnpm 11.17.0（由根目录 `packageManager` 固定）。准备好对应版本后，在仓库根目录执行：

```bash
pnpm install
pnpm run dev
```

以终端输出的地址为准，默认地址为 `http://localhost:3000/`。开发站点直接引用组件源码。

| 命令 | 说明 |
| --- | --- |
| `pnpm run dev` | 启动文档站与组件预览 |
| `pnpm run typecheck` | 检查组件包和文档站的 TypeScript 类型 |
| `pnpm test` | 运行两个 workspace 的测试 |
| `pnpm run build:lib` | 构建组件包及类型声明，输出到 `packages/media-rig/dist` |
| `pnpm run build:preview` | 构建 Next.js 文档站，输出到 `apps/docs/.next` |
| `pnpm run build:registry` | 根据 Registry 定义生成 `apps/docs/public/r/*.json` |
| `pnpm run build:site` | 构建 Registry、文档站及部署产物 |
| `pnpm run preview` | 启动 Next.js 生产服务（需先构建） |
| `pnpm run check:docs` | 检查运行中的文档站：静态内容、SEO、旧链接和 404；可用 `DOCS_URL` 指定地址 |

## 项目结构

```text
media-rig/
├── apps/docs/                 # 文档站、组件目录与在线演示
│   ├── src/app/               # 静态路由、Metadata、sitemap 与 robots
│   ├── src/preview/           # 页面 UI 与客户端交互演示
│   └── public/                # 示例素材和生成的 Registry
├── packages/media-rig/        # 可发布的 npm 组件包
│   └── src/components/
│       ├── light-sphere/
│       ├── image-angle-rig/
│       ├── director-stage/
│       ├── image-editor/
│       ├── image-annotation/
│       └── layer-separator/
├── scripts/                  # 构建产物处理脚本
├── pnpm-workspace.yaml       # Workspace 包目录与安装配置
├── pnpm-lock.yaml            # 依赖锁文件
├── registry.json             # shadcn Registry 定义
└── apps/docs/vercel.json     # Next.js 文档站部署配置
```

官网使用 Next.js App Router：组件文档静态生成，交互演示在客户端按需加载。`/components/<slug>` 提供独立标题、描述、canonical 和分享信息；`/sitemap.xml` 与 `/robots.txt` 随构建生成。旧版 `?component=`、`?demo=` 地址自动跳转，独立导演台位于 `/playground/director-stage`。

项目使用 pnpm workspace。组件包与文档站独立组织，文档站代码不会进入组件包构建产物。

## 构建与发布

提交前本仓库使用 Node.js 24 和 pnpm 11.17.0（由根目录 `packageManager` 固定）。准备好对应版本后，在仓库根目录执行：

```bash
pnpm run typecheck
pnpm test
pnpm run build:lib
pnpm run build:site
pnpm --filter media-rig pack --dry-run
```

文档站使用 Vercel 部署，Root Directory 为 `apps/docs`，Framework Preset 为 Next.js。构建前生成 Registry，Next.js 产物写入 `apps/docs/.next`。当前生产站点随 `main` 分支更新。

发布 npm 包前，更新 [`packages/media-rig/package.json`](./packages/media-rig/package.json) 中的版本及包元数据，并检查打包文件。具备 npm 发布权限后，在组件包目录执行：

```bash
cd packages/media-rig
pnpm login
pnpm publish --access public
```

网站部署与 npm 发包是两个独立流程；更新网站不会自动发布新的 npm 版本。

## 演示视频

[查看演示视频](./apps/docs/public/assets/20260525-184216.mp4)。视频为阶段性录制，当前功能以在线演示为准。

## 反馈与贡献

欢迎通过 [Issues](https://github.com/Hello-job/media-rig/issues) 提交问题或建议。反馈问题时请附上复现步骤、浏览器与依赖版本，以及必要的截图。提交组件修改时，请同步更新示例、类型和 Registry 定义，并运行相关检查。
