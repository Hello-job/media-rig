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

### Video Trim

```tsx
import { VideoTrim } from 'media-rig/video-trim';
import 'media-rig/style.css';

<VideoTrim
  src="/video.mp4"
  onExport={(blob, { range, duration, width, height }) => {
    // Download or upload the MP4 here. Revoke object URLs when no longer used.
    console.log(blob, range, duration, width, height);
  }}
/>
```

Migrated from the tamen-web video node: thumbnail strip, draggable endpoints and
selection, whole-second snapping, keyboard adjustments, selection looping and
MP4 export with the source audio when present. `onRangeChange` returns start/end
seconds; `onError` reports media/export failures; `onClose` enables closing;
`locale` accepts `zh-CN` (default) or `en-US`.

Encoding runs locally in an isolated FFmpeg worker and can be cancelled. Changing
`src` or unmounting aborts pending work. The FFmpeg JS/WASM core is fetched on first
export from the pinned `@ffmpeg/core@0.12.10` jsDelivr URL; the host must permit
that fetch and blob workers. Remote videos must allow CORS. Long or high-resolution
videos may require substantial browser memory. No upload service is included.

Source installation: `pnpm dlx media-rig@latest add video-trim`.
The source version includes its own scoped CSS.

## Video Editor

```tsx
import { useState } from "react";
import { VideoEditor, EMPTY_EDIT, type VideoEditorSource } from "media-rig/video-editor";
import "media-rig/style.css";

export function Editor({ sources }: { sources: VideoEditorSource[] }) {
  const [value, onChange] = useState(EMPTY_EDIT);
  return <div style={{ height: 720 }}>
    <VideoEditor value={value} onChange={onChange} sources={sources} autoImport />
  </div>;
}
```

Migrated from tamen-web's standalone component: multi-clip timeline, splitting,
trimming, audio envelopes, text, subtitle tracks, preview, and undo/redo.
Sources use stable `id`, `url`, `label`, and `kind: "video" | "audio"` fields.
Optional `services` supplies metadata, thumbnails, and waveforms. `translate`
overrides the built-in English messages. `readOnly` disables editing.

Encoding and saving belong to the host: supply `exportActions` and `onExport` to
show export controls. Honor its `signal`, `onProgress`, resolution and format.
This package does not include the original app's upload or canvas adapters.

Source installation: `pnpm dlx media-rig@latest add video-editor`.
Local demo: `/components/video-editor`.
