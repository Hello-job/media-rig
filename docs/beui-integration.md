# beUI 集成

来源：[beUI 官方注册表](https://beui.dev/registry.json)、[安装说明](https://beui.dev/docs/ai-agents)。通过项目现有 `pnpm exec shadcn add https://beui.dev/r/<slug>.json --yes` 下载官方源码，没有重新实现组件动画。

| 官方安装名称 | 使用位置 |
| --- | --- |
| `button-base` | 文档操作、目录布局、各媒体编辑器及导演台操作按钮 |
| `tabs` | 目录分类、预览/代码/Props、CLI/手动安装 |
| `select` | 移动端分类、包管理器、安装工具、画布比例、导演台模型/体型/动画/道具/对准对象 |
| `input` | 目录与场景搜索、编辑器数值输入、导演台名称 |
| `tooltip` | 复制/下载按钮、图片编辑器与导演台图标工具栏 |
| `bouncy-accordion` | 首次安装与环境配置 |
| `loader` | 异步加载交互演示 |
| `popover-morph` | Copy for AI 操作面板 |
| `number-ticker` | 分类/搜索结果数量 |
| `code-block` | Usage 源码、行号和语法高亮；打开代码页签后按需加载 |
| `range-slider` | 打光亮度/色温、多角度参数、画笔粗细/透明度、图层缩放、关节和环境参数、时间线缩放 |
| `switch` | 轮廓光、广角镜头、导演台地面开关 |

没有对应通用组件的媒体功能保留原实现：视频双端选区、画布与 3D 拖拽、运镜轨道/播放标尺，以及浏览器文件和颜色选择器。没有添加与项目无关的聊天、钱包、排期等组件。

## 目录和发行

- 文档站：`apps/docs/src/components/motion`、`components/agents` 与 `src/lib`。
- 发布包：`packages/media-rig/src/components/motion`；共享依赖位于该目录的 `lib`，导入调整为相对路径，兼容 npm 构建与 shadcn 源码安装。
- 两个项目的 `components.json` 已配置 `@beui`，可以使用 `pnpm exec shadcn add @beui/<slug>`。
- `registry.json` 包含每个媒体组件实际引用的 beUI 文件、依赖闭包、主题 CSS 和许可证；更新后运行 `pnpm build:registry`。
- 发布包声明 `motion`、`clsx`、`tailwind-merge`；构建时外置这些依赖。
- 官方 MIT 许可证保留在文档源码目录和 `packages/media-rig/BEUI-LICENSE`，随 npm 包和 registry 文件分发。

## 对官方源码的兼容修正

保留 beUI 的动画实现，以下是集成所需的修正：

- Tabs：隐藏和显示使用相同 DOM/React 组件类型，避免切换页签重置媒体编辑器；补齐方向键、Home/End、焦点和面板关联。
- Select：透传可访问名称，增加 combobox 语义、方向键选项导航、Escape/选择后的焦点恢复，以及关闭时的选项 tabIndex。
- 发布包：相对导入与局部主题变量，避免依赖文档站的 `@/lib` 或宿主主题；原有业务回调、滑块提交时机及画布事件隔离保持不变。

升级这些文件时不要无检查地使用 `--overwrite`；需要保留上述兼容修正和现有 `utils.ts`。
