# MediaRig

[中文](./README.md) | English

MediaRig is a React component library for building interactive media effect controls.

The library includes lighting, perspective, scene composition, image editing, and AI layer-separation workflows. The goal is to turn common media configuration experiences into reusable, ready-made components.

This component library also helps developers save tokens and avoid rebuilding the same interaction patterns from scratch.

## Live Component Catalog

Open the [MediaRig component catalog](https://media-rig.vercel.app/) to browse every component, try the live previews, copy installation commands, and review the core APIs.

## Demo Video

<video src="./public/assets/20260525-184216.mp4" controls muted playsinline width="100%"></video>

If your Markdown environment does not render the video, open [`public/assets/20260525-184216.mp4`](./public/assets/20260525-184216.mp4) directly.

## Install

### Package installation (pnpm)

```bash
pnpm add media-rig three @react-three/fiber @react-three/drei
```

### shadcn source install

If you want to install the component source into your project like shadcn/ui, use the shadcn CLI with this GitHub registry:

```bash
pnpm dlx shadcn@latest add https://media-rig.vercel.app/r/light-sphere.json
pnpm dlx shadcn@latest add https://media-rig.vercel.app/r/image-angle-rig.json
pnpm dlx shadcn@latest add https://media-rig.vercel.app/r/director-stage.json
pnpm dlx shadcn@latest add https://media-rig.vercel.app/r/image-editor.json
pnpm dlx shadcn@latest add https://media-rig.vercel.app/r/layer-separator.json
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

Local preview: `http://localhost:3000/components/image-editor`.

## LayerSeparator

`LayerSeparator` provides region selection, prompting, async progress, and editable layer composition. The host supplies the model integration through `onSeparate`, keeping the package provider-independent.

```tsx
import { LayerSeparator } from "media-rig/layer-separator";
import "media-rig/style.css";

export default function App() {
  return (
    <LayerSeparator
      imageUrl="/source.jpg"
      aspectRatio={3 / 2}
      onSeparate={async (request) => {
        const response = await fetch("/api/separate-layers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });
        return response.json();
      }}
      onMerge={(blob) => console.log(blob)}
    />
  );
}
```

`onSeparate` returns `{ background, layers }`. Each layer accepts a transparent image URL plus optional `contentBounds` and `transform`. Remote assets must allow CORS for browser-side merge export.

Local preview: `http://localhost:3000/components/layer-separator`.

## Local Development

```bash
pnpm install
pnpm run dev
```

Open `http://localhost:3000/` to use the preview/configuration UI.

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
      layer-separator/
registry.json
```

The npm component package and public documentation site are independent workspaces in the same repository.

The root `registry.json` builds all component installers into `apps/docs/public/r`.

## Build

Build the npm package:

```bash
pnpm run build:lib
```

Build the preview app:

```bash
pnpm run build:preview
```

## Publish Checklist

1. Confirm the license and author fields.
2. Run `pnpm run typecheck`.
3. Run `pnpm run build:lib`.
4. Run `pnpm --filter media-rig pack --dry-run` to inspect published files.
5. Log in with `pnpm login`.
6. Publish with `pnpm publish --access public`.

### Install component source with shadcn

Each component page provides copyable pnpm (default), npm, yarn, and bun commands. In a React 19 / Tailwind CSS 4 project, run `pnpm dlx shadcn@latest init` once if you do not have `components.json`, then install a component:

```sh
pnpm dlx shadcn@latest add https://media-rig.vercel.app/r/image-annotation.json
```

Source, styles, and dependencies are installed together. Files follow your `components.json` components alias. Import from `@/components/image-annotation` instead of the npm package. The same URL pattern supports all seven component slugs, including `video-trim`.

For pnpm 11 browser projects, merge this into `pnpm-workspace.yaml` before installation to skip Fabric's optional native Node canvas build and align transitive Three.js types. Preserve existing settings and check compatibility if your project already uses Three.js.

```yaml
allowBuilds:
  canvas: false
overrides:
  '@types/three': '^0.168.0'
```

## MediaRig CLI

`media-rig@0.2.0` is published on npm with a `media-rig` binary. Use the short commands below, `pnpm cli` in this repository for development, or the existing shadcn URL commands.

```sh
# Install component source
npx media-rig@latest init
npx media-rig@latest list
npx media-rig@latest add image-annotation
pnpm dlx media-rig@latest add light-sphere director-stage

# Local development
pnpm cli add image-annotation --cwd /path/to/react-app
pnpm cli add director-stage --cwd /path/to/react-app --dry-run
```

Requires Node.js 22.12+ and npm/npx. The wrapper runs a tested, pinned shadcn CLI version and inherits its interactive installation flow and target package-manager detection. The consumer needs React 19, Tailwind CSS 4 and `components.json` (run `init` once). Options: `--cwd` / `-c`, `--yes` / `-y`, `--overwrite` / `-o`, and `--dry-run`. Overwrite is never enabled implicitly. See the pnpm 11 configuration above before installing Fabric or Three.js components.

### Video Trim

Video clipping with a thumbnail timeline, draggable range, whole-second snapping, loop preview and browser MP4 export. Receive the result via `onExport`; pending work is cancellable.

`import { VideoTrim } from "media-rig/video-trim"`

Docs: `/components/video-trim` · [API and runtime requirements](packages/media-rig/README.md#video-trim)
