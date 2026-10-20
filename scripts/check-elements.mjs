import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { components } = require('../dist/index.js');
const browser = require('../dist/elements.js');
const node = require('../dist/elements.node.js');

const problems = [];
for (const component of components) {
  if (!browser.hasComponentElement(component.id)) {
    problems.push(`${component.id}: no loader in src/elements.ts`);
    continue;
  }
  const loaded = await browser.loadComponentElement(component.id);
  if (loaded !== component.element) problems.push(`${component.id}: src/elements.ts loads a different element`);
  if (node.getComponentElement(component.id) !== component.element) problems.push(`${component.id}: elements.node differs`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`elements: ${components.length} components match their loaders`);
