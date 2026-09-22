import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const entryPath = (path: string) => decodeURIComponent(new URL(path, import.meta.url).pathname);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: false,
  build: {
    lib: {
      entry: {
        "video-trim": entryPath("./src/components/video-trim/index.ts"),
        index: entryPath("./src/index.ts"),
        "light-sphere": entryPath("./src/components/light-sphere/index.ts"),
        "image-angle-rig": entryPath("./src/components/image-angle-rig/index.ts"),
        "director-stage": entryPath("./src/components/director-stage/index.ts"),
        "image-annotation": entryPath("./src/components/image-annotation/index.ts"),
        "image-editor": entryPath("./src/components/image-editor/index.ts"),
        "layer-separator": entryPath("./src/components/layer-separator/index.ts"),
      },
      name: "ReactImageEffects",
      cssFileName: "style",
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "lucide-react",
        "motion/react",
        "clsx",
        "tailwind-merge",
        "three",
        "@react-three/fiber",
        "@react-three/drei",
        "fabric",
        "@ffmpeg/ffmpeg",
        "@ffmpeg/util",
      ],
      output: {
        exports: "named",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "ReactJSXRuntime",
          "react/jsx-dev-runtime": "ReactJSXDevRuntime",
          "lucide-react": "LucideReact",
          three: "THREE",
          "@react-three/fiber": "ReactThreeFiber",
          "@react-three/drei": "ReactThreeDrei",
          fabric: "fabric",
        },
      },
    },
  },
});
