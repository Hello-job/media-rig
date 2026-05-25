# MediaRig

中文 | [English](./README.en.md)

MediaRig 是一个 React 组件库，用于构建交互式媒体效果控制组件。

当前第一个组件是 `LightSphere`：一个基于 Three.js 的灯光控制器，可用于图片布光预览。项目目标是把常见的媒体配置体验沉淀为可复用、开箱即用的组件。

这个组件库也希望帮助开发者节省 token，避免在相似场景里重复造轮子。

## 视频演示

<video src="./public/assets/20260525-184216.mp4" controls muted playsinline width="100%"></video>

如果当前 Markdown 环境不显示视频，可以直接打开 [`public/assets/20260525-184216.mp4`](./public/assets/20260525-184216.mp4)。

## 安装

```bash
npm install media-rig three @react-three/fiber @react-three/drei
```

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
