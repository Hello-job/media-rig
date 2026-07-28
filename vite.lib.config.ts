import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const entryPath = (path: string) => decodeURIComponent(new URL(path, import.meta.url).pathname);

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    lib: {
      entry: {
        index: entryPath("./src/index.ts"),
        "light-sphere": entryPath("./src/components/light-sphere/index.ts"),
        "image-angle-rig": entryPath("./src/components/image-angle-rig/index.ts"),
        "director-stage": entryPath("./src/components/director-stage/index.ts"),
        "image-editor": entryPath("./src/components/image-editor/index.ts"),
      },
      name: "ReactImageEffects",
      formats: ["es", "cjs"],
      fileName: (format, entryName) => `${entryName}.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "three",
        "@react-three/fiber",
        "@react-three/drei",
        "fabric",
      ],
      output: {
        exports: "named",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          three: "THREE",
          "@react-three/fiber": "ReactThreeFiber",
          "@react-three/drei": "ReactThreeDrei",
          fabric: "fabric",
        },
      },
    },
  },
});
