import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import path from "path";

export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "CntrlComponents",
      fileName: (format) => (format === "es" ? "index.mjs" : "index.js"),
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: (id) =>
        !id.includes("@splidejs") &&
        (["react", "react-dom", "classnames"].includes(id) || id.startsWith("react/")),
      output: {
        preserveModules: false,
        manualChunks: undefined,
      }
    },
    outDir: "dist",
    emptyOutDir: true,
  },
  css: {
    modules: {
      generateScopedName: "[name]__[local]___[hash:base64:5]",
    },
  },
});
