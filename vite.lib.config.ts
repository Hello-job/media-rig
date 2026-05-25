import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    lib: {
      entry: new URL("./src/index.ts", import.meta.url).pathname,
      name: "ReactImageEffects",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "mjs" : "cjs"}`,
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "three",
        "@react-three/fiber",
        "@react-three/drei",
      ],
      output: {
        exports: "named",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          three: "THREE",
          "@react-three/fiber": "ReactThreeFiber",
          "@react-three/drei": "ReactThreeDrei",
        },
      },
    },
  },
});
