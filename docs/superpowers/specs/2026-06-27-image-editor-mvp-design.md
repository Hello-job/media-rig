# Image Editor MVP 设计规格

日期：2026-06-27

## 1. 背景

MediaRig 需要新增一个基于 Fabric.js 的通用图片编辑组件。组件以用户提供的深色全屏编辑器截图为视觉参考，提供完整可用的单画布编辑能力，并保持与现有 `LightSphere`、`DirectorStage` 相同的 React 组件库定位：既可以作为 npm 包使用，也能够作为源码组件集成。

本规格只覆盖通用图片编辑 MVP。智能抠图、AI 生图、多页面和高级滤镜不属于本阶段。

## 2. 目标

- 提供开箱即用、具有完整默认界面的 React 图片编辑组件。
- 使用 Fabric.js 管理画布对象、选区和变换交互。
- 支持图片、文本、基础图形、箭头和自由绘制。
- 支持可靠的撤销、重做、保存、恢复和图片导出。
- 通过清晰的组件 API 和命令 API 支持业务侧嵌入。
- 将 Fabric.js 隔离在组件内部，避免业务方依赖其对象模型。

## 3. 非目标

MVP 不实现以下能力：

- 智能抠图、背景移除和分割模型。
- AI 图片生成或提示词输入。
- 多页面、多画布和页面排序。
- 实时协作、评论、版本云同步。
- PSD、SVG 工程文件导入。
- 高级滤镜、蒙版、混合模式和非破坏性效果栈。
- 自定义字体上传。
- 移动端完整编辑体验。

## 4. 方案选择

采用“分层式编辑器”方案。它在首版开发成本和后续扩展性之间最均衡，优于把 UI、Fabric 实例和历史记录塞进单一组件，也比纯 Headless 内核更快形成可直接使用的产品体验。

组件结构：

```text
ImageEditor
├── EditorShell          页面布局、工具栏和面板
├── CanvasViewport       画布缩放、居中和尺寸适配
├── FabricCanvas         Fabric 实例和对象事件
├── EditorCommands       添加、删除、变换、图层和裁剪命令
├── HistoryManager       撤销、重做和操作合并
├── DocumentSerializer   JSON 保存、加载和版本校验
└── ExportService        PNG、JPEG 和 Blob 导出
```

React 负责界面状态和组件生命周期；Fabric.js 负责画布绘制、命中测试、选区和对象变换。所有编辑操作统一经过命令层，UI 不直接散落调用 Fabric API。

Fabric.js 作为 MediaRig 的直接运行时依赖，Fabric 类型和实例不出现在公共组件 API 中。

## 5. 用户界面

### 5.1 布局

- 顶部栏：画布比例、背景色、保存、下载、关闭。
- 左侧栏：图片上传、图层列表入口。
- 底部工具栏：选择、图形、箭头、画笔、文本、图片、撤销、重做、适应窗口。
- 对象浮动栏：根据图片、文本或图形显示对应快捷操作。
- 中央工作区：深色背景、居中的画布、缩放和平移交互。

单画布 MVP 不显示右侧翻页栏和底部 AI 输入框。

### 5.2 响应式行为

- 父容器必须提供稳定宽高，编辑器默认占满父容器。
- 桌面端为主要目标，建议最小可用尺寸为 `960 × 640`。
- 较窄容器中，底部工具栏允许水平滚动，不挤压画布。
- 画布始终按当前缩放比例居中显示，不能撑破工作区。
- 浏览器全屏只影响编辑器根节点。

## 6. MVP 功能

### 6.1 画布和文档

- 新建、清空和加载单个画布文档。
- 比例预设：`custom`、`16:9`、`9:16`、`4:3`、`3:4`、`1:1`、`3:2`、`2:3`、`7:4`、`4:7`、`21:9`。
- 自定义画布宽高。
- 背景色和透明背景。
- 画布缩放、平移、适应窗口和全屏。
- 高清屏 DPR 适配。
- 改变画布尺寸时保持对象坐标和尺寸，不自动拉伸对象；超出新边界的内容允许暂时被裁切。该操作可撤销。

### 6.2 图片导入

- 支持文件选择、拖放和剪贴板粘贴。
- 支持 PNG、JPEG、WebP 和 GIF；GIF 在 MVP 中按静态首帧处理。
- 默认单文件上限为 15 MB，可通过属性配置。
- 本地文件转换为 Data URL 后写入文档，保证 JSON 可重新加载。
- URL 图片通过命令 API 导入；跨域失败时不创建残缺对象。
- 新图片按等比缩放方式放入画布中心，初始尺寸不超过画布可见区域的 80%。

### 6.3 对象和选区

- 支持图片、文本、矩形、椭圆、直线、箭头和自由绘制路径。
- 支持单选、框选、多选和点击空白取消选择。
- 支持移动、缩放、旋转、复制、粘贴、克隆和删除。
- 支持锁定、隐藏、置顶、置底、上移一层和下移一层。
- 支持水平居中、垂直居中和画布中心对齐。
- 对象拥有稳定 `id`，业务逻辑不得依赖对象数组下标。
- 显示基础对齐辅助线，支持画布中心和对象边缘吸附；按住修饰键可临时关闭吸附。

### 6.4 文本

- 单击工具创建文本，双击文本进入编辑。
- 支持字体、字号、颜色、粗体、斜体、水平对齐、行高和字间距。
- MVP 使用浏览器系统字体及项目已加载的 Geist 字体，不提供字体上传。
- 文本编辑期间快捷键不得触发画布命令。

### 6.5 图形和画笔

- 矩形和椭圆支持填充色、描边色、描边宽度和透明度。
- 直线和箭头支持颜色、宽度和透明度。
- 自由画笔支持颜色、宽度和透明度。
- 退出画笔工具后自动回到选择工具。

### 6.6 图片操作

- 支持水平翻转、垂直翻转、透明度、替换图片和删除。
- 支持进入裁剪模式，在固定显示框内平移和缩放图片源。
- 裁剪模式提供确认和取消；确认生成一条历史记录，取消恢复进入裁剪前的状态。
- 图片可执行“适应画布”和“填充画布”，两者均保持原始宽高比。

### 6.7 历史记录

- 支持撤销和重做，默认最多保留 50 个文档快照。
- 拖动、缩放和旋转过程中实时渲染，交互结束后只提交一条历史记录。
- 连续文本输入按一次编辑会话合并。
- 加载文档时暂停历史记录，加载完成后建立新的初始快照。
- 执行新操作后清空重做栈。
- 选区、缩放比例、工具切换和面板开关不进入历史记录。

### 6.8 快捷键

- `Cmd/Ctrl + Z`：撤销。
- `Shift + Cmd/Ctrl + Z` 或 `Cmd/Ctrl + Y`：重做。
- `Cmd/Ctrl + C`、`Cmd/Ctrl + V`、`Cmd/Ctrl + D`：复制、粘贴、克隆。
- `Delete` 或 `Backspace`：删除选中对象。
- `Escape`：退出当前编辑模式或清除选区。
- 快捷键在输入框、文本域和 Fabric 文本编辑状态中停用。

### 6.9 保存和导出

- 保存为版本化 `ImageEditorDocument` JSON。
- 支持从 JSON 恢复画布和对象。
- 支持导出 PNG 和 JPEG；PNG 支持透明背景，JPEG 提供质量参数。
- 支持返回 `Blob`、触发浏览器下载以及通过回调交给宿主处理。
- 导出像素尺寸必须等于文档画布尺寸；视口缩放不影响导出结果。
- 被跨域资源污染的画布在导出前检测并返回明确错误。

## 7. 数据模型

```ts
type ImageEditorDocument = {
  version: 1;
  canvas: {
    width: number;
    height: number;
    background: string | null;
  };
  objects: EditorObject[];
};

type EditorObject = {
  id: string;
  type:
    | "image"
    | "text"
    | "rect"
    | "ellipse"
    | "line"
    | "arrow"
    | "drawing";
  name: string;
  locked: boolean;
  visible: boolean;
  fabricData: Record<string, unknown>;
};

type ImageEditorState = {
  activeTool: ImageEditorTool;
  selectedIds: string[];
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  isLoading: boolean;
};
```

`ImageEditorDocument` 是可持久化数据；`ImageEditorState` 是运行时 UI 状态。缩放、选区和当前工具不写入作品 JSON。

## 8. 数据流

```text
用户触发工具或快捷键
→ EditorCommand 校验上下文并执行
→ Fabric 更新画布对象
→ 选区与属性面板同步
→ HistoryManager 提交文档快照
→ onChange 返回可持久化文档
```

加载流程：

```text
校验 JSON 和版本
→ 暂停画布事件与历史提交
→ Fabric 加载对象
→ 补齐对象元数据
→ 恢复事件
→ 建立初始历史快照
→ 更新 React 状态
```

## 9. 公共 API

```ts
type ImageEditorProps = {
  className?: string;
  style?: React.CSSProperties;
  initialDocument?: ImageEditorDocument;
  storageKey?: string | false;
  maxImageSize?: number;
  historyLimit?: number;
  onChange?: (document: ImageEditorDocument) => void;
  onSelectionChange?: (objects: EditorObject[]) => void;
  onSave?: (document: ImageEditorDocument) => void;
  onExport?: (result: Blob) => void;
  onClose?: () => void;
  onError?: (error: ImageEditorError) => void;
};

type ImageEditorHandle = {
  addImage(source: File | string): Promise<string>;
  addText(text?: string): string;
  loadDocument(document: ImageEditorDocument): Promise<void>;
  getDocument(): ImageEditorDocument;
  undo(): void;
  redo(): void;
  fitToViewport(): void;
  exportImage(options: ExportOptions): Promise<Blob>;
};
```

`storageKey` 为字符串时使用浏览器 `localStorage` 保存最新文档；为 `false` 或未提供时不进行内部持久化。公共 API 不返回 Fabric 对象。

## 10. 目录结构

```text
src/components/image-editor/
├── ImageEditor.tsx
├── ImageEditor.types.ts
├── ImageEditor.constants.ts
├── ImageEditor.css
├── index.ts
├── core/
│   ├── EditorCommands.ts
│   ├── HistoryManager.ts
│   ├── DocumentSerializer.ts
│   └── ExportService.ts
├── hooks/
│   ├── useFabricCanvas.ts
│   ├── useEditorKeyboard.ts
│   └── useEditorState.ts
├── toolbars/
├── panels/
├── controls/
└── utils/
```

预览页面放在 `src/preview/pages/ImageEditorPreview.tsx`，不混入可发布组件代码。

## 11. 错误处理

- 文件类型或大小不合法：拒绝导入，调用 `onError`，当前文档保持不变。
- 图片解码或 URL 加载失败：移除临时加载状态，不创建对象。
- JSON 结构损坏或版本不兼容：拒绝加载，不覆盖当前文档。
- 跨域画布无法导出：返回具备错误码和用户可读消息的异常。
- 本地存储空间不足：编辑功能继续可用，通过 `onError` 报告保存失败。
- Fabric 初始化失败：显示编辑器级错误状态，禁用编辑命令。
- 组件卸载：注销全局快捷键和 Fabric 事件，释放临时 Object URL 并销毁画布实例。

所有异步操作都必须在编辑器中显示明确的加载或失败状态，不能静默失败。

## 12. 可访问性

- 所有图标按钮提供 `aria-label`、标题提示和可见焦点样式。
- 工具栏使用合适的 `toolbar`、`button` 和选中状态语义。
- 颜色不是表达选中、错误或禁用状态的唯一方式。
- 键盘可以访问顶部栏、侧栏、底部工具栏和浮动工具栏。
- 状态提示使用可被辅助技术感知的区域。
- 画布对象的精细移动仍以指针操作为主；MVP 不宣称完整满足画布内容的无障碍编辑。

## 13. 测试策略

### 13.1 单元测试

- 命令的前置条件、执行结果和错误分支。
- 历史快照提交、合并、上限、撤销和重做。
- 文档序列化、版本校验和非法数据拒绝。
- 导出参数转换和错误映射。

### 13.2 集成测试

- 添加、选择、移动、缩放、旋转、复制、删除对象。
- 图层顺序、锁定和隐藏。
- 文本编辑与快捷键隔离。
- 图片裁剪的确认和取消。
- 画布尺寸变化及撤销恢复。
- 保存文档后重新加载，视觉和对象属性保持一致。
- PNG、JPEG 导出尺寸与画布尺寸一致。

### 13.3 生命周期和视觉检查

- 重复挂载和销毁不残留 Fabric 实例、事件或 Object URL。
- 在目标桌面尺寸及较窄容器下检查画布居中、工具栏溢出和浮层位置。
- 与参考截图核对深色背景、控制层级、边距、圆角和按钮状态。

## 14. 完成标准

满足以下条件时，MVP 才视为完成：

1. 所有列入 MVP 的可见控件都有真实行为，不存在静态占位按钮。
2. 支持的对象可以被创建、编辑、排序、锁定、隐藏和删除。
3. 撤销、重做覆盖所有文档级操作，并且连续变换不会产生历史噪声。
4. 文档 JSON 可保存并重新加载，画布尺寸、背景、对象外观和层级保持一致。
5. PNG、JPEG 导出尺寸准确，透明背景和质量参数按设置生效。
6. 失败的图片、文档和导出操作不会破坏当前作品。
7. 组件在卸载后不残留全局监听或 Fabric 实例。
8. 类型检查、自动化测试和库构建通过。

## 15. 后续阶段

MVP 完成后可独立规划以下增强，不提前耦合进首版内核：

- 图层面板增强、对象分组和命名。
- 亮度、对比度、饱和度和模糊滤镜。
- 蒙版、智能抠图和背景替换。
- 模板、素材库和 AI 图片生成。
- 多页面、云端存储和协作能力。
