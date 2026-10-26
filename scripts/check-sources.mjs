import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { components, nonForkableComponentIds } = require('../dist/index.js');
const { componentSources } = require('../dist/sources.js');

const problems = [];
const definitionIds = new Set(components.map(component => component.id));
for (const id of definitionIds) {
  const hasSource = typeof componentSources[id] === 'string' && componentSources[id].length > 0;
  const nonForkable = nonForkableComponentIds.includes(id);
  if (hasSource && nonForkable) problems.push(`${id}: has a source but is listed in nonForkableComponentIds`);
  if (!hasSource && !nonForkable) problems.push(`${id}: no entry in componentSources and not listed in nonForkableComponentIds`);
}
for (const id of Object.keys(componentSources)) {
  if (!definitionIds.has(id)) problems.push(`${id}: in componentSources but has no definition`);
}
for (const id of nonForkableComponentIds) {
  if (!definitionIds.has(id)) problems.push(`${id}: in nonForkableComponentIds but has no definition`);
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`sources: ${Object.keys(componentSources).length} components have sources, ${nonForkableComponentIds.length} are non-forkable`);
