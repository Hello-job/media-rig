# media-rig

React 媒体交互组件，包含图片涂鸦、图层分离、图片编辑、视角调整、布光和 3D 导演台。

[完整文档与在线预览](https://media-rig.vercel.app)

## CLI（从包含此入口的版本开始支持）

```bash
npx media-rig@latest init
npx media-rig@latest list
npx media-rig@latest add image-annotation
pnpm dlx media-rig@latest add light-sphere director-stage
```

需要 Node.js 22.12+、npm/npx，以及 React 19 / Tailwind CSS 4 项目。已有 `components.json` 时可以跳过初始化。通过 shadcn 将源码、样式与依赖添加到目标项目，安装后从本地组件目录导入。

可选参数：`--cwd <目录>`、`--yes`、`--overwrite`、`--dry-run`。默认不强制覆盖文件。`--help` 查看帮助。

pnpm 11 浏览器项目在 `pnpm-workspace.yaml` 中合并以下配置：

```yaml
allowBuilds:
  canvas: false
overrides:
  '@types/three': '^0.168.0'
```

这会跳过 Fabric 可选的 Node canvas 原生构建并统一 Three.js 类型。保留已有配置，并检查已有 Three.js 依赖的兼容性。

## 组件包

```tsx
import { ImageAnnotation } from "media-rig/image-annotation";
import "media-rig/style.css";
```
