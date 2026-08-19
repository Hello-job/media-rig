# MediaRig

[中文](./README.md) | English

MediaRig is a React component library for building interactive media effect controls.

The first component is `LightSphere`, a Three.js-powered light controller for image lighting previews. The goal is to turn common media configuration experiences into reusable, ready-made components.

This component library also helps developers save tokens and avoid rebuilding the same interaction patterns from scratch.

## Live Component Catalog

Open the [MediaRig component catalog](https://media-rig.vercel.app/) to browse every component, try the live previews, copy installation commands, and review the core APIs.

## Demo Video

<video src="./public/assets/20260525-184216.mp4" controls muted playsinline width="100%"></video>

If your Markdown environment does not render the video, open [`public/assets/20260525-184216.mp4`](./public/assets/20260525-184216.mp4) directly.

## Install

### npm package

```bash
npm install media-rig three @react-three/fiber @react-three/drei
```

### shadcn source install

If you want to install the component source into your project like shadcn/ui, use the shadcn CLI with this GitHub registry:

```bash
npx shadcn@latest add https://media-rig.vercel.app/r/light-sphere.json
npx shadcn@latest add https://media-rig.vercel.app/r/image-angle-rig.json
npx shadcn@latest add https://media-rig.vercel.app/r/director-stage.json
npx shadcn@latest add https://media-rig.vercel.app/r/image-editor.json
```

The component source will be written to:

```txt
components/light-sphere/
```

The default demo image will be written to:

```txt
public/assets/photo-texture2.png
```

The root [`registry.json`](./registry.json) is compiled into the public Docs app, so users can install components directly from the deployed registry URL.

## Usage

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

The parent container must have a stable width and height.

## Props

| Prop | Type | Default |
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

## ImageEditor

`ImageEditor` is a Fabric.js-powered single-canvas editor with images, text, shapes, free drawing, layers, cropping, undo/redo, JSON persistence, and PNG/JPEG export.

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

The parent must provide stable dimensions. PNG, JPEG, WebP, and static GIF are supported by default, with a 15 MB per-file limit. Remote images must allow cross-origin reads or browser export will be blocked.

Common props include `initialDocument`, `storageKey`, `maxImageSize`, `historyLimit`, `onChange`, `onSave`, `onExport`, `onClose`, and `onError`. The component ref exposes `addImage`, `addText`, `loadDocument`, `getDocument`, `undo`, `redo`, `fitToViewport`, and `exportImage`.

Local preview: `http://localhost:5173/components/image-editor`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/` to use the preview/configuration UI.

## Project Structure

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

The npm component package and public documentation site are independent workspaces in the same repository.

The root `registry.json` builds all component installers into `apps/docs/public/r`.

## Build

Build the npm package:

```bash
npm run build:lib
```

Build the preview app:

```bash
npm run build:preview
```

## Publish Checklist

1. Confirm the license and author fields.
2. Run `npm run typecheck`.
3. Run `npm run build:lib`.
4. Run `npm pack --dry-run` to inspect published files.
5. Log in with `npm login`.
6. Publish with `npm publish --access public`.
