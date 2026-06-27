# MediaRig

中文 | [English](./README.en.md)

MediaRig 是一个 React 组件库，用于构建交互式媒体效果控制组件。

当前第一个组件是 `LightSphere`：一个基于 Three.js 的灯光控制器，可用于图片布光预览。项目目标是把常见的媒体配置体验沉淀为可复用、开箱即用的组件。

这个组件库也希望帮助开发者节省 token，避免在相似场景里重复造轮子。

## 视频演示

<video src="./public/assets/20260525-184216.mp4" controls muted playsinline width="100%"></video>

如果当前 Markdown 环境不显示视频，可以直接打开 [`public/assets/20260525-184216.mp4`](./public/assets/20260525-184216.mp4)。

## 安装

### npm 包安装

```bash
npm install media-rig three @react-three/fiber @react-three/drei
```

### shadcn 源码安装

如果你希望像 shadcn/ui 一样把组件源码下载安装到项目目录里，可以使用 shadcn CLI 从 GitHub registry 安装：

```bash
npx shadcn@latest add your-name/media-rig/light-sphere
```

安装后组件源码会写入：

```txt
components/light-sphere/
```

默认演示图片会写入：

```txt
public/assets/photo-texture2.png
```

发布到 GitHub 前，请把根目录 [`registry.json`](./registry.json) 里的 `homepage` 和上面的 `your-name/media-rig` 替换成真实仓库地址。公开仓库可直接作为 shadcn GitHub registry 使用。

## 使用

```jsx
import { LightSphere } from "media-rig";

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

本地预览：`http://localhost:5173/?demo=editor`。

## 本地开发

```bash
npm install
npm run dev
```

打开 `http://localhost:5173/` 使用预览和配置界面。

## 项目结构

```txt
src/
  components/
    index.ts
    light-sphere/
      LightSphere.tsx
      LightSphere.constants.ts
      LightSphere.types.ts
      index.ts
      hooks/
      parts/
      shaders/
      utils/
  preview/
    components/
    pages/
    main.tsx
    styles.css
  index.ts
```

组件库代码位于 `src/components`，仅用于预览的界面位于 `src/preview`。

根目录的 `registry.json` 用于 shadcn 源码安装，会把 `src/components/light-sphere` 复制到用户项目的 `components/light-sphere`。

## 构建

构建 npm 包：

```bash
npm run build:lib
```

构建预览应用：

```bash
npm run build:preview
```

## 发布检查清单

1. 确认 `license` 和 `author` 字段。
2. 运行 `npm run typecheck`。
3. 运行 `npm run build:lib`。
4. 运行 `npm pack --dry-run` 检查发布文件。
5. 使用 `npm login` 登录。
6. 使用 `npm publish --access public` 发布。
