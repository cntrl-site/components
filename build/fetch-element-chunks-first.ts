import type { Plugin } from "vite";

export const fetchElementChunksFirst = (elementsEntry: string): Plugin => ({
  name: "fetch-element-chunks-first",
  generateBundle(_, bundle) {
    for (const chunk of Object.values(bundle)) {
      if (chunk.type === "chunk" && chunk.facadeModuleId === elementsEntry) {
        chunk.code = chunk.code.replace(/\bimport\(\s*(["']\.\/)/g, 'import(/* webpackFetchPriority: "high" */ $1');
      }
    }
  },
});
