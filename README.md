# MediaRig

中文 | [English](./README.en.md)

MediaRig 是一个 React 媒体组件库 workspace：`packages/media-rig` 负责可发布组件包，`apps/docs` 负责对外官网、文档和在线预览。

当前组件包括用于图片布光预览的 `LightSphere`、用于图片透视调整的 `ImageAngleRig`，以及用于角色、道具与机位编排的 `DirectorStage`。项目目标是把常见的媒体配置体验沉淀为可复用、开箱即用的组件。

这个组件库也希望帮助开发者节省 token，避免在相似场景里重复造轮子。

## 在线组件目录

打开 [MediaRig 组件目录](https://media-rig.vercel.app/) 查看组件列表、实时预览、安装命令、核心 API 和源码示例。

## 视频演示

<video src="./public/assets/20260525-184216.mp4" controls muted playsinline width="100%"></video>

如果当前 Markdown 环境不显示视频，可以直接打开 [`public/assets/20260525-184216.mp4`](./public/assets/20260525-184216.mp4)。

## 安装

### npm 包安装

```bash
npm install media-rig three @react-three/fiber @react-three/drei
```

### shadcn 源码安装

如果你希望像 shadcn/ui 一样把组件源码下载安装到项目目录里，可以直接使用在线 Registry：

```bash
npx shadcn@latest add https://media-rig.vercel.app/r/light-sphere.json
npx shadcn@latest add https://media-rig.vercel.app/r/image-angle-rig.json
npx shadcn@latest add https://media-rig.vercel.app/r/director-stage.json
npx shadcn@latest add https://media-rig.vercel.app/r/image-editor.json
```

安装后对应组件源码会写入：

```txt
components/<component-name>/
```

默认演示图片会写入：

```txt
public/assets/photo-texture2.png
```

Registry 定义位于根目录 [`registry.json`](./registry.json)，运行 `npm run build:registry` 会生成 `apps/docs/public/r/*.json`。

## 使用

```jsx
import { LightSphere } from "media-rig/light-sphere";

export default function App() {
  return (
    <div style={{ width: 432, height: 408 }}>
      <LightSphere
        imageUrl="/your-image.png"
        color="#ffffff"
        intensity={0.72}
        spread={0.38}
      />
    </div>
  );
}
```

父级容器需要提供稳定的宽度和高度。

### 图片多角度调整

`ImageAngleRig` 会把输入图片居中裁成正方形并贴在圆角实体方块的正面，其他面带有方向字母；横拖与竖拖会保持单轴，明确的斜向拖动会同时调整旋转和倾斜，也可以通过旋转、倾斜、整体方块缩放滑杆和广角开关精调。

```jsx
import { ImageAngleRig } from "media-rig/image-angle-rig";

export default function App() {
  return (
    <div style={{ width: 860, height: 520 }}>
      <ImageAngleRig
        imageUrl="/your-image.png"
        defaultValue={{ yaw: 34, pitch: -25, zoom: 0 }}
        onChange={(value) => console.log(value)}
        actionInput={{ imageId: "image-01" }}
        onAction={({ value, input }) => console.log(value, input)}
      />
    </div>
  );
}
```

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| `imageUrl` | `string` | `"/assets/photo-texture2.png"` |
| `value` | `Partial<ImageAngleState>` | `undefined` |
| `defaultValue` | `Partial<ImageAngleState>` | `{ yaw: 34, pitch: -25, zoom: 0, wideAngle: false }` |
| `onChange` | `(value) => void` | `undefined` |
| `onChangeEnd` | `(value) => void` | `undefined` |
| `actionButton` | `ComponentType<ImageAngleActionButtonProps>` | 默认“确认调整”按钮 |
| `actionInput` | `unknown` | `undefined` |
| `onAction` | `({ value, input }, event) => void` | `undefined` |
| `dragAxisLockThreshold` | `number` | `8` |
| `title` | `string` | `"拖拽图片调整角度"` |

## 属性

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| `imageUrl` | `string` | `"/assets/photo-texture2.png"` |
| `color` | `string` | `"#ff2200"` |
| `spread` | `number` | `0.38` |
| `intensity` | `number` | `0.72` |
| `glowRadius` | `number` | `1.8` |
| `glowIntensity` | `number` | `1.2` |
| `baseLineOpacity` | `number` | `0.045` |
| `sphereRadius` | `number` | `2.45` |
| `targetPosition` | `{ x, y, z }` | `null` |
| `onLightMove` | `(position) => void` | `undefined` |
| `onLightSettle` | `(position) => void` | `undefined` |

## ImageEditor 图片编辑器

`ImageEditor` 是一个基于 Fabric.js 的单画布编辑器，内置图片、文本、图形、绘色板、图层、裁剪、撤销重做、JSON 持久化和 PNG/JPEG 导出。绘色板支持红色默认画笔、1–40 px 宽度、10%–100% 不透明度、颜色选择和仅擦除轨迹经过区域的局部橡皮擦；底部基础图形入口精简为矩形，箭头通过拖拽确定方向并默认使用红色。

```tsx
import { useRef } from "react";
import { ImageEditor, type ImageEditorHandle } from "media-rig";

export default function App() {
  const editorRef = useRef<ImageEditorHandle>(null);
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ImageEditor
        ref={editorRef}
        storageKey="my-image-editor"
        onSave={(document) => console.log(document)}
      />
    </div>
  );
}
```

父容器需要提供稳定宽高。默认支持 PNG、JPEG、WebP 和静态 GIF，单文件上限为 15 MB。远程图片必须允许跨域读取，否则浏览器会阻止导出。

常用属性包括 `initialDocument`、`storageKey`、`maxImageSize`、`historyLimit`、`onChange`、`onSave`、`onExport`、`onClose` 和 `onError`。组件 ref 提供 `addImage`、`addText`、`loadDocument`、`getDocument`、`undo`、`redo`、`fitToViewport` 与 `exportImage`。

本地预览：`http://localhost:5173/components/image-editor`。

## 本地开发

```bash
npm install
npm run dev
```

打开 `http://localhost:5173/` 使用预览和配置界面。

## 项目结构

```txt
apps/
  docs/
    src/preview/
    public/
packages/
  media-rig/
    src/components/
      light-sphere/
      image-angle-rig/
      director-stage/
      image-editor/
registry.json
```

组件库与官网是两个独立 workspace。官网开发不会混入 npm 包产物，组件包也不依赖文档站代码。

根目录的 `registry.json` 用于 shadcn 源码安装，目前包含四个组件；构建结果写入 `apps/docs/public/r` 并随官网发布。

## 构建

构建 npm 包：

```bash
npm run build:lib
```

构建预览应用：

```bash
npm run build:preview
```

仅构建 shadcn Registry：

```bash
npm run build:registry
```

## 发布检查清单

1. 确认 `license` 和 `author` 字段。
2. 运行 `npm run typecheck`。
3. 运行 `npm run build:lib`。
4. 运行 `npm pack --dry-run` 检查发布文件。
5. 进入 `packages/media-rig` 后使用 `npm login` 登录。
6. 在组件包目录使用 `npm publish --access public` 发布。
