import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { components } = require('../dist/index.js');
const browser = require('../dist/elements.js');
const node = require('../dist/elements.node.js');

const problems = [];
const browserApi = Object.keys(browser).sort().join(', ');
const nodeApi = Object.keys(node).sort().join(', ');
if (browserApi !== nodeApi) problems.push(`elements exports ${browserApi} but elements.node exports ${nodeApi}`);

const staticRequires = [...readFileSync(new URL('../dist/elements.js', import.meta.url), 'utf8')
  .matchAll(/\brequire\(\s*["'](\.\/[^"']+)["']\s*\)/g)].map(match => match[1]);
for (const target of staticRequires) problems.push(`elements.js statically requires ${target}`);

for (const file of ['elements.js', 'elements.mjs']) {
  const code = readFileSync(new URL(`../dist/${file}`, import.meta.url), 'utf8');
  const imports = code.match(/\bimport\((?:\s*\/\*[^*]*\*\/)?\s*["']\.\//g)?.length ?? 0;
  const prioritized = code.match(/\bimport\(\/\* webpackFetchPriority: "high" \*\/ ["']\.\//g)?.length ?? 0;
  if (!imports || imports !== prioritized) problems.push(`${file}: ${imports - prioritized} of ${imports} element import() calls lack webpackFetchPriority "high"`);
}

const definitionIds = new Set(components.map(component => component.id));
for (const id of browser.componentElementIds) {
  if (!definitionIds.has(id)) problems.push(`${id}: loader in src/elements.ts has no definition`);
}
for (const component of components) {
  if (node.getComponentElement(component.id) !== component.element) problems.push(`${component.id}: elements.node differs`);
  if (!browser.hasComponentElement(component.id)) {
    problems.push(`${component.id}: no loader in src/elements.ts`);
    continue;
  }
  try {
    const loaded = await browser.loadComponentElement(component.id);
    if (loaded !== component.element) problems.push(`${component.id}: src/elements.ts loads a different element`);
  } catch (error) {
    problems.push(`${component.id}: loader failed (${error.message})`);
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`elements: ${components.length} components match their loaders`);
