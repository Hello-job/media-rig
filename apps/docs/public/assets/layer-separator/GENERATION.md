# 摄影风格示例素材

使用内置 imagegen 生成，非实拍照片。

- `scene.png`：Photorealistic minimal interior editorial photograph, ivory plaster wall, pale oak floor, warm daylight from the left. Three separate objects: cream textured ceramic vase with olive branches on the left, cognac leather and dark oak lounge chair in the center, black stem floor lamp with a white globe on the right. No people, text or extra objects. Landscape 3:2.
- `background.png`：Edit the scene, removing the vase, branches, chair, lamp and their shadows. Preserve the exact framing, wall, floor and natural lighting. Empty architectural background, 1536 × 1024.
- `vase.png`、`chair.png`、`lamp.png`：Extract only the ceramic vase with branches / leather lounge chair / globe floor lamp from the scene. Preserve its appearance, exact position and scale on the original 1536 × 1024 canvas. Remove all other objects and background; transparent background, no checkerboard.

生成的物体素材未包含透明通道；经用户同意，使用本地颜色分离与边缘蒙版去除棋盘格，保存为 RGBA PNG。最终 `scene.png` 由背景与三个透明物体图层合成，保证拆分前后构图一致。

图层分离演示使用预置素材，未连接在线分割模型。
