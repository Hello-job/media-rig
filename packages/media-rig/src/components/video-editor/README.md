# VideoEditor

可嵌入容器的受控 React 视频剪辑器。组件不读取 Canvas Store、路由、项目 ID、应用翻译 Provider，也不负责上传、下载或持久化。通过宿主回调接入素材、编码和存储服务。

## 接入

从本目录 `index.ts` 导入 `VideoEditor`、`EMPTY_EDIT` 和所需类型。父容器需要有明确高度；全屏弹窗由宿主包裹，组件本身不固定到视口。

```tsx
import { useState } from "react";
import {
  VideoEditor,
  EMPTY_EDIT,
  type VideoEditorProps,
} from "media-rig/video-editor";

export function EditingPanel({
  sources,
  services,
  onExport,
  translate,
  exportActions,
}: Pick<
  VideoEditorProps,
  "sources" | "services" | "onExport" | "translate" | "exportActions"
>) {
  const [document, setDocument] = useState(EMPTY_EDIT);
  return (
    <div className="h-[720px]">
      <VideoEditor
        value={document}
        onChange={setDocument}
        sources={sources}
        services={services}
        translate={translate}
        exportActions={exportActions}
        onExport={onExport}
        autoImport
      />
    </div>
  );
}
```

| 参数 | 约定 |
| --- | --- |
| `value` / `onChange` | 唯一工程数据源。收到新值立即更新 React 状态，持久化可另行防抖。保持未改变文档的对象引用；外部替换文档会使旧撤销历史失效，并中止进行中的任务。不要原地修改数据。 |
| `sources` | `{ id, url, label, kind: "video" \| "audio" }[]`。`id` 是宿主定义的稳定素材 ID，与节点、连线或数据库无关；同一实例内必须唯一。 |
| `autoImport` | 默认 `false`。开启后按列表顺序导入新素材；已导入或手动删除的素材通过 `importedSources` 记忆，不自动重复添加。工具栏无素材添加入口；从空工程接入视频和音频时应开启自动导入，或由宿主提供已有工程/控制器入口。 |
| `services` | 可替换素材元数据、缩略图和波形加载，见下文。 |
| `onExport` | 接收 `{ document, destination, settings, signal, onProgress }`。宿主负责编码以及最终保存位置；成功 resolve，失败 reject。 |
| `exportActions` | `{ id, label }[]`，点击后将 `id` 原样传给导出回调。不传则隐藏导出菜单。标签由宿主本地化。 |
| `recommendedResolution` | 可选 `480 \| 720 \| 1080`，作为默认分辨率并标注「推荐」。由宿主评估本地设备或服务端能力；用户手动选择后不被推荐值覆盖，所有档位始终可选。 |
| `translate` | `(key, values?) => string`，键以 `videoEditor.` 开头，默认使用模块内英文。占位符为 `{name}`。 |
| `readOnly` | 禁止编辑、导入和导出；变化为只读时中止任务。 |
| `onClose` / `className` | 可选关闭按钮与容器样式。没有 `onClose` 则不显示关闭按钮。 |

`useVideoEditor` 提供相同受控协议的编辑控制器，可用于自定义 UI。`VideoEditorPanel` 和 context 是仓库内组合细节，不属于公开入口。

导出设置通过 `VideoEditorExportSettings` 传给宿主：`resolution` 为 `480 | 720 | 1080`，`format` 为 `"mp4" | "mov"`。未传推荐值时默认 1080P / MP4；`useVideoEditor.exportVideo(destination, settings)` 可由自定义入口调用，省略 settings 仍使用 1080P / MP4。内置设置面板确认后才调用导出，宿主需要兑现所选尺寸、封装格式和文件类型。

## 媒体与导出适配

- `loadSource(source, signal)`：默认使用浏览器媒体元素读取时长和尺寸；覆盖时返回含这些字段的 `EditSource`，保留输入的 ID、URL 和媒体类型。
- `loadThumbnails(url, signal)`：可选，默认在浏览器内均匀抽取 12 帧；可覆盖为自定义图片地址数组。组件按裁剪区间显示，抽帧失败时显示片段名称。
- `loadWaveform(url)`：可选，返回沿原片时间均匀采样的幅度数组，数值范围 0–1；不提供或失败时显示名称。
- 素材 URL 支持 HTTP、`blob:` 等浏览器可播放地址。宿主负责 CORS、授权、地址有效期和缓存；组件不会撤销宿主创建的 blob URL。持久化宿主应在保存前换成稳定地址。
- 导出回调必须遵守 `AbortSignal`，取消时停止编码和后续上传等副作用。组件在取消、卸载、外部替换工程、移除使用中的素材或进入只读时中止任务；不遵守 signal 的外部任务无法由组件强制停止。
- 不传导出回调时没有默认编码器。如需 MP4 / MOV 导出，宿主需提供对应编码器。

`VideoEditDocument` 是可序列化数据；主视频连续排列，音频和文字按开始时间叠加。时间单位秒，音量为线性倍率，视频位置为画面内中心点的归一化坐标，文字位置为画面归一化坐标。主视频决定总时长，输出比例由第一段视频决定，尺寸上限 1920×1080。不是任意轨道布局或画中画编辑器。

字幕以 `TextClip.textType: "subtitle"`（公开类型 `SubtitleClip`）保存，未设置该字段的旧文字仍是普通文字，工程版本保持 1。新建字幕轨道使用独立 `trackId`，旧工程未设置该字段的字幕仍归入 `subtitles` 轨道，沿用分割、裁剪、显隐和历史协议；控制器 `updateClip` 将字幕样式变更仅同步到同轨字幕，文字内容和时间只修改当前句。内置字幕面板支持手动逐句编辑，字幕保留拖动与位置调节；普通文字用灰蓝色轨道，字幕用低饱和棕色轨道。组件和 Canvas 绘制均留在通用模块，不依赖画布业务。宿主导出器应兑现文字时间区间、字幕描边及轨道显隐；语音识别不属于本版本。

## MediaRig 安装

```tsx
import { VideoEditor, EMPTY_EDIT } from "media-rig/video-editor";
import "media-rig/style.css";
```

组件容器需要明确高度。也可使用 `pnpm dlx media-rig@latest add video-editor` 安装源码。源码方式需要 Tailwind CSS 4 扫描安装目录。

基础控件位于 `internal/`，样式 Token 限定在编辑器和浮层内。滑块及 Tabs 的上游许可随 `BEUI-LICENSE` 保留。

导出编码器由宿主通过 `onExport` 提供；本次迁移不包含原项目的画布、上传与持久化适配器。

## 验证

`pnpm --filter media-rig exec vitest run src/components/video-editor/__tests__`
