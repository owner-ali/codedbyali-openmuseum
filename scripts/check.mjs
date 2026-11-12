// Quick sanity check you can run before building: `npm run check`
// 1) every source file parses, 2) every relative import points to a real file,
// 3) every named import exists in the file it comes from.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { transformSync } from 'esbuild'; // installed with Vite

const root = resolve('src');
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    statSync(p).isDirectory() ? walk(p) : /\.(jsx?|mjs)$/.test(f) && files.push(p);
  }
})(root);

const EXT = ['', '.js', '.jsx', '/index.js', '/index.jsx'];
const find = (base) => EXT.map((e) => base + e).find((p) => existsSync(p) && statSync(p).isFile());
const exportsOf = (src) => {
  const names = new Set();
  for (const m of src.matchAll(/export\s+(?:async\s+)?(?:function\*?|const|let|var|class)\s+([A-Za-z0-9_$]+)/g)) names.add(m[1]);
  for (const m of src.matchAll(/export\s*\{([^}]+)\}/g)) m[1].split(',').forEach((n) => names.add(n.trim().split(/\s+as\s+/).pop()));
  if (/export\s+default/.test(src)) names.add('default');
  return names;
};

let problems = 0;
const fail = (msg) => { problems++; console.error('✗', msg); };

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  try {
    transformSync(src, { loader: 'jsx', jsx: 'automatic' });
  } catch (e) {
    fail(`${file}: ${e.message.split('\n')[0]}`);
    continue;
  }
  for (const m of src.matchAll(/import\s+([^'\";]*?)\s+from\s+'(\.[^']+)'/g)) {
    const target = find(resolve(dirname(file), m[2]));
    if (!target) { fail(`${file}: cannot find ${m[2]}`); continue; }
    if (!/\.jsx?$/.test(target)) continue;
    const ex = exportsOf(readFileSync(target, 'utf8'));
    const clause = m[1];
    const def = clause.match(/^([A-Za-z0-9_$]+)\s*(,|$)/);
    if (def && !ex.has('default')) fail(`${file}: ${m[2]} has no default export`);
    const named = clause.match(/\{([^}]+)\}/);
    if (named) {
      for (const n of named[1].split(',').map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean)) {
        if (!ex.has(n)) fail(`${file}: ${m[2]} does not export "${n}"`);
      }
    }
  }
}
console.log(problems ? `\n${problems} problem(s) found.` : `OK: ${files.length} files checked, no problems.`);
process.exit(problems ? 1 : 0);
