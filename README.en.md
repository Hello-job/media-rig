# MediaRig

[中文](./README.md) | English

MediaRig is a React component library for building interactive media effect controls.

The first component is `LightSphere`, a Three.js-powered light controller for image lighting previews. The goal is to turn common media configuration experiences into reusable, ready-made components.

This component library also helps developers save tokens and avoid rebuilding the same interaction patterns from scratch.

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
npx shadcn@latest add your-name/media-rig/light-sphere
```

The component source will be written to:

```txt
components/light-sphere/
```

The default demo image will be written to:

```txt
public/assets/photo-texture2.png
```

Before publishing the repository, replace `homepage` in [`registry.json`](./registry.json) and `your-name/media-rig` above with the real GitHub repository. A public repository with a root `registry.json` can be used directly as a shadcn GitHub registry.

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

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/` to use the preview/configuration UI.

## Project Structure

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

Library code lives under `src/components`. Preview-only UI lives under `src/preview`.

The root `registry.json` powers shadcn source installs by copying `src/components/light-sphere` into `components/light-sphere` in the user's project.

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
