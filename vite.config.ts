import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import path from "path";
import { keepHyphenPatternsLazy } from "./build/keep-hyphen-patterns-lazy";

const keepDynamicImportInCjs = (): Plugin => ({
  name: "keep-dynamic-import-in-cjs",
  renderDynamicImport({ format }) {
    return format === "cjs" ? { left: "import(", right: ")" } : null;
  },
});

export default defineConfig({
  plugins: [react(), dts(), keepDynamicImportInCjs(), keepHyphenPatternsLazy()],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
        utils: path.resolve(__dirname, "src/Components/utils/index.ts"),
        sources: path.resolve(__dirname, "src/sources.ts"),
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: (id) =>
        !id.includes("@splidejs") &&
        (["react", "react-dom", "classnames", "franc-min"].includes(id) || id.startsWith("react/")),
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
