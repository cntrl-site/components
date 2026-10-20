import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { components } = require('../dist/index.js');
const browser = require('../dist/elements.js');
const node = require('../dist/elements.node.js');

const problems = [];
const definitionIds = new Set(components.map(component => component.id));
for (const id of browser.componentElementIds) {
  if (!definitionIds.has(id)) problems.push(`${id}: loader in src/elements.ts has no definition`);
}
const browserIds = new Set(browser.componentElementIds);
const nodeIds = new Set(node.componentElementIds);
for (const id of browserIds) {
  if (!nodeIds.has(id)) problems.push(`${id}: loader in src/elements.ts but not elements.node`);
}
for (const id of nodeIds) {
  if (!browserIds.has(id)) problems.push(`${id}: in elements.node but no loader in src/elements.ts`);
}
for (const component of components) {
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
  if (node.getComponentElement(component.id) !== component.element) problems.push(`${component.id}: elements.node differs`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`elements: ${components.length} components match their loaders`);
