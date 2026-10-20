import path from "path";
import type { Plugin, Rollup } from "vite";

const collectLoads = (ast: unknown) => {
  const requires: string[] = [];
  const imports: string[] = [];
  const visit = (node: any): void => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (node.type === "ImportExpression" && typeof node.source?.value === "string") imports.push(node.source.value);
    if (node.type === "CallExpression" && node.callee?.type === "Identifier" && node.callee.name === "require"
      && typeof node.arguments[0]?.value === "string") requires.push(node.arguments[0].value);
    for (const key in node) visit(node[key]);
  };
  visit(ast);
  return { requires, imports };
};

export const keepHyphenPatternsLazy = (): Plugin => ({
  name: "keep-hyphen-patterns-lazy",
  generateBundle({ format }, bundle) {
    if (format !== "cjs") return;
    const chunks = Object.values(bundle).filter((file): file is Rollup.OutputChunk => file.type === "chunk");
    const loads = new Map(chunks.map(chunk => [chunk.fileName, collectLoads(this.parse(chunk.code))]));
    const resolve = (from: string, specifier: string) => path.posix.join(path.posix.dirname(from), specifier);
    const patterns = chunks
      .filter(chunk => chunk.moduleIds.some(id => id.includes("/hyphen/patterns/")))
      .map(chunk => chunk.fileName);
    if (!patterns.length) this.error("no chunk contains hyphen/patterns modules");

    const imported = new Set([...loads].flatMap(([file, { imports }]) =>
      imports.filter(specifier => specifier.startsWith(".")).map(specifier => resolve(file, specifier))));
    const notImported = patterns.filter(file => !imported.has(file));
    if (notImported.length) this.error(`hyphen patterns no chunk loads with import(): ${notImported.join(", ")}`);

    for (const entry of chunks.filter(chunk => chunk.isEntry)) {
      const reached = new Set<string>();
      const visit = (file: string) => {
        if (reached.has(file) || !loads.has(file)) return;
        reached.add(file);
        loads.get(file)!.requires
          .filter(specifier => specifier.startsWith("."))
          .forEach(specifier => visit(resolve(file, specifier)));
      };
      visit(entry.fileName);
      const required = patterns.filter(file => reached.has(file));
      if (required.length) this.error(`${entry.fileName} statically requires hyphen patterns: ${required.join(", ")}`);
    }
  },
});
