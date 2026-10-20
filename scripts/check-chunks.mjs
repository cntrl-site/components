import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const pkg = createRequire(import.meta.url)('../package.json');

const PATTERN_MARKER = 'hyphenationPatterns';
const STATIC_REQUIRE = /\brequire\(\s*["'](\.\/[^"']+)["']\s*\)/g;
const DYNAMIC_IMPORT = /\bimport\(\s*["'](\.\/[^"']+)["']\s*\)/g;

const chunks = new Map(
  readdirSync(dist)
    .filter(file => file.endsWith('.js'))
    .map(file => [file, readFileSync(path.join(dist, file), 'utf8')]),
);
const targets = (file, pattern) => [...chunks.get(file).matchAll(pattern)].map(match => path.normalize(match[1]));

const requireEntries = value => (value === null || typeof value !== 'object'
  ? []
  : Object.entries(value).flatMap(([condition, target]) =>
      condition === 'require' && typeof target === 'string' ? [target] : requireEntries(target)));
const entries = requireEntries(pkg.exports).map(target => path.relative(dist, path.resolve(root, target)));

const problems = [];
const patternChunks = [...chunks.keys()].filter(file => chunks.get(file).includes(PATTERN_MARKER));
if (!patternChunks.length) problems.push(`no chunk in dist contains "${PATTERN_MARKER}"`);

const dynamicTargets = new Set([...chunks.keys()].flatMap(file => targets(file, DYNAMIC_IMPORT)));
for (const file of patternChunks) {
  if (!dynamicTargets.has(file)) problems.push(`${file}: hyphenation patterns that nothing import()s`);
}

for (const entry of entries) {
  if (!chunks.has(entry)) {
    problems.push(`${entry}: listed in package.json exports but missing from dist`);
    continue;
  }
  const loaded = new Set();
  const visit = (file) => {
    if (loaded.has(file) || !chunks.has(file)) return;
    loaded.add(file);
    targets(file, STATIC_REQUIRE).forEach(visit);
  };
  visit(entry);
  for (const file of patternChunks) {
    if (loaded.has(file)) problems.push(`${entry}: statically requires hyphenation patterns in ${file}`);
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`chunks: ${patternChunks.length} hyphenation pattern chunks, none required by ${entries.join(', ')}`);
