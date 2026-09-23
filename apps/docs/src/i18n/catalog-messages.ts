export const catalogMessages: [string, string][] = [
  ["视频剪辑：画面预览、剪辑工具与多轨时间线", "Video editing: preview, editing tools, and a multi-track timeline"],
  ["受控视频剪辑器，支持多片段时间线、音频混合、文字字幕、分割裁剪与撤销重做。", "A controlled video editor with a multi-clip timeline, audio mixing, text, subtitles, splitting, trimming, and undo/redo."],
  ["视频剪辑", "Video editing"],
  ["受控工程数据；保持未修改对象的引用，更新时立即提交状态。", "Controlled project data. Preserve unchanged object references and commit state updates immediately."],
  ["视频和音频素材列表，包含唯一 id、url、label 和 kind。", "Video and audio sources with unique id, url, label, and kind fields."],
  ["自动按顺序导入新素材。", "Automatically import new sources in order."],
  ["可注入元数据、缩略图和波形加载器。", "Inject metadata, thumbnail, and waveform loaders."],
  ["由宿主实现编码与保存，支持取消及进度回报；组件不内置编码器。", "The host provides encoding and saving with cancellation and progress reporting. No encoder is bundled."],
  ["可替换内置文案，键以 videoEditor. 开头。", "Override built-in messages using keys prefixed with videoEditor."],
  ["禁用编辑、导入和导出。", "Disable editing, importing, and exporting."],
  ["添加视频或音频，开始剪辑；支持文字、字幕和撤销重做。", "Add video or audio to start editing, with text, subtitles, and undo/redo."],
  ["添加素材", "Add media"],
  ["素材仅在浏览器本地使用。此演示展示剪辑功能，视频编码与保存可通过 onExport 接入。", "Media stays in your browser. This demo shows editing; connect encoding and saving through onExport."],

  [
    "带缩略图时间轴的视频片段截取组件，支持拖动选区、整秒吸附、循环预览，并在浏览器内导出含音轨的 MP4。",
    "Trim video on a thumbnail timeline with draggable selections, whole-second snapping, loop playback, and in-browser MP4 export with audio."
  ],
  [
    "从视频中选出需要的片段，预览后生成独立视频。",
    "Select a video segment, preview it, and export a standalone clip."
  ],
  [
    "视频 URL 或本地 object URL；远程视频需支持 CORS。更换后重置选区并取消旧任务。",
    "Video or local object URL. Remote videos require CORS. Changing the source resets the selection and cancels pending tasks."
  ],
  [
    "接收 MP4、截取范围、时长和尺寸，由宿主下载或上传。首次生成从 CDN 加载 FFmpeg 引擎。",
    "Receives the MP4, selected range, duration, and dimensions for download or upload. The first export loads FFmpeg from a CDN."
  ],
  [
    "初始化及调整选区时返回起止秒数。支持方向键、Shift 和 Home / End 调整。",
    "Reports start and end times on initialization and selection changes. Supports arrow keys, Shift, and Home / End."
  ],
  [
    "视频读取、播放或导出失败回调。",
    "Called when video loading, playback, or export fails."
  ],
  [
    "提供时显示关闭按钮，并在组件内响应 Escape。卸载会终止截取任务。",
    "Shows a close button and handles Escape when provided. Unmounting stops the export task."
  ],
  [
    "内置界面语言。",
    "Built-in interface language."
  ],
  [
    "视频封面及组件外观。",
    "Video poster and component appearance."
  ],
  [
    "轻量图片涂鸦组件，支持画笔、矩形、文字、选择变换、撤销重做与原尺寸 PNG 合成导出。",
    "A lightweight image annotation component with brushes, rectangles, text, selection transforms, undo/redo, and original-size PNG export."
  ],
  [
    "在图片上画出想法，标记重点，再保存为完整图片。",
    "Draw ideas and mark details on an image, then save the combined result."
  ],
  [
    "原图地址；更换后重置画布与历史。跨域图片需支持 CORS。",
    "Source image URL. Changing it resets the canvas and history. Cross-origin images require CORS."
  ],
  [
    "原图的替代文本。",
    "Alternative text for the source image."
  ],
  [
    "接收原图尺寸的 PNG 合成结果，由宿主下载或上传。",
    "Receives the composed PNG at its original size for download or upload."
  ],
  [
    "显示退出按钮，并响应 Escape。",
    "Shows an exit button and handles Escape."
  ],
  [
    "图片加载、画布初始化和保存失败回调。",
    "Called when image loading, canvas initialization, or saving fails."
  ],
  [
    "提供框选提示、自动拆分、异步进度和分离结果编排的图层分离工作台；模型请求由宿主应用接入。",
    "A layer separation workspace with selection hints, automatic separation, asynchronous progress, and result composition. Connect your own model service."
  ],
  [
    "把单张图片拆成可独立移动、旋转、翻转和合并的透明图层。",
    "Split an image into transparent layers that can be moved, rotated, flipped, and merged."
  ],
  [
    "等待拆分的源图片地址。",
    "URL of the source image to separate."
  ],
  [
    "接入任意图层分离服务，并返回背景与透明图层。",
    "Connect a layer separation service that returns a background and transparent layers."
  ],
  [
    "受控的分层结果与图层变换。",
    "Controlled separation result and layer transforms."
  ],
  [
    "移动、旋转、翻转或显隐图层时触发。",
    "Called when layers are moved, rotated, flipped, shown, or hidden."
  ],
  [
    "浏览器合成 PNG 后触发。",
    "Called after composing a PNG in the browser."
  ],
  [
    "内置界面语言。",
    "Built-in interface language."
  ],
  [
    "集成图片导入、裁剪、绘制、擦除、图形、文本、图层与导出的深色画布编辑器。",
    "A dark canvas editor with image import, cropping, painting, erasing, shapes, text, layers, and export."
  ],
  [
    "面向媒体工作流的可嵌入式图片编辑工作台。",
    "An embeddable image editing workspace for media workflows."
  ],
  [
    "初始化画布、对象和图层。",
    "Initial canvas, objects, and layers."
  ],
  [
    "启用本地文档持久化。",
    "Enables local document persistence."
  ],
  [
    "编辑文档变化时触发。",
    "Called when the document changes."
  ],
  [
    "完成图片导出时触发。",
    "Called when an image export completes."
  ],
  [
    "导入、画布或导出失败时触发。",
    "Called when importing, canvas operations, or exporting fails."
  ],
  [
    "在整块预览区拖拽调整水平旋转与垂直倾斜，通过整数滑杆控制角度和镜头推进。",
    "Drag anywhere in the preview to adjust horizontal rotation and vertical tilt. Use integer sliders to control angles and camera distance."
  ],
  [
    "用于商品图、封面和视觉素材的多角度构图控制器。",
    "Multi-angle composition controls for product images, covers, and visual assets."
  ],
  [
    "正面展示的图片地址。",
    "URL of the front-facing image."
  ],
  [
    "受控角度、倾斜和缩放状态。",
    "Controlled rotation, tilt, and zoom state."
  ],
  [
    "拖拽或参数变化时触发。",
    "Called when dragging or parameters change."
  ],
  [
    "右下角自定义操作按钮。",
    "Custom action button in the bottom-right corner."
  ],
  [
    "初始状态；重置恢复内置默认值。",
    "Initial state. Reset restores the built-in defaults."
  ],
  [
    "拖拽或滑杆操作结束、切换广角、重置时提交参数。",
    "Commits parameters after dragging or slider changes, toggling wide angle, or resetting."
  ],
  [
    "拖拽启动距离（像素）；按预览区尺寸映射角度，不锁轴。",
    "Drag activation distance in pixels. Angles are mapped to the preview size without axis locking."
  ],
  [
    "已弃用，保留为 dragThreshold 的兼容别名。",
    "Deprecated compatibility alias for dragThreshold."
  ],
  [
    "操作处理中，显示加载状态并阻止重复触发。",
    "Shows a loading state and prevents duplicate actions."
  ],
  [
    "禁用操作按钮。",
    "Disables the action button."
  ],
  [
    "提供时显示关闭按钮，由宿主管理显隐。",
    "Shows a close button when provided. Visibility is managed by the host."
  ],
  [
    "通过球面灯位、色温、强度和光束参数，为图片建立可视化布光方案。",
    "Build a visual lighting setup using spherical light positions, color temperature, intensity, and beam controls."
  ],
  [
    "面向摄影、海报和生成式图片工作流的交互式布光组件。",
    "Interactive lighting controls for photography, posters, and generative image workflows."
  ],
  [
    "LightSpherePanel 与 LightSphere 的预览图片。",
    "Preview image for LightSpherePanel and LightSphere."
  ],
  [
    "面板的受控状态或初始状态。",
    "Controlled or initial panel state."
  ],
  [
    "滑杆、视角、方向预设、轮廓光和拖拽灯位的状态更新。",
    "Reports changes to sliders, views, direction presets, rim light, and dragged light positions."
  ],
  [
    "调节完成后提交完整状态。",
    "Commits the full state when an adjustment ends."
  ],
  [
    "提供时显示关闭按钮。",
    "Shows a close button when provided."
  ],
  [
    "应用当前打光方案；轮廓光作为输出参数传递。",
    "Applies the current lighting setup, including rim light in the output parameters."
  ],
  [
    "可注入自定义操作按钮，接收 value、input、disabled 和 loading。",
    "Custom action button receiving value, input, disabled, and loading."
  ],
  [
    "处理中状态和禁用状态。",
    "Loading and disabled states."
  ],
  [
    "在同一个 3D 工作台中组织角色、道具、摄影机与构图，快速搭建镜头关系。",
    "Arrange characters, props, cameras, and composition in one 3D workspace to plan your shots."
  ],
  [
    "适合分镜、姿态预演与生成式视频前期编排的导演台。",
    "A workspace for storyboarding, pose previews, and generative video preproduction."
  ],
  [
    "初始化角色、道具和摄影机。",
    "Initial characters, props, and cameras."
  ],
  [
    "场景编排变化时触发。",
    "Called when the scene composition changes."
  ],
  [
    "本地草稿键；false 关闭持久化。",
    "Local draft storage key. Set false to disable persistence."
  ],
  [
    "按选定画幅截图时触发。",
    "Called when capturing the selected aspect ratio."
  ],
  [
    "根容器尺寸样式。",
    "Root container dimensions and styles."
  ]
];
