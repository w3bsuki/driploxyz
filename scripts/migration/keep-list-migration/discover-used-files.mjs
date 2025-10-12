#!/usr/bin/env node
import { globby } from 'globby';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * A very lightweight import graph scanner for TS/JS/Svelte files.
 * It finds import/export statements and Svelte <script> import lines.
 */
const IMPORT_RE = /\bfrom\s+['"]([^'"\n]+)['"]|\bimport\(\s*['"]([^'"\n]+)['"]\s*\)/g;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveRelative(base, spec) {
  if (!spec.startsWith('.') && !spec.startsWith('/')) return null; // ignore bare imports
  const withExts = ['.ts', '.tsx', '.js', '.jsx', '.svelte', '/index.ts', '/index.js'];
  for (const ext of withExts) {
    const p = path.resolve(path.dirname(base), spec + ext);
    // We won't stat here for speed; rely on globs to include canonical files.
    return path.normalize(p);
  }
}

async function extractImports(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    const src = raw.replace(/<!--([\s\S]*?)-->/g, ''); // strip HTML comments in svelte
    const matches = [...src.matchAll(IMPORT_RE)];
    const specs = matches.map((m) => m[1] || m[2]).filter(Boolean);
    const rels = specs.map((s) => resolveRelative(filePath, s)).filter(Boolean);
    return new Set(rels);
  } catch {
    return new Set();
  }
}

async function main() {
  const roots = process.env.KEEP_ENTRYPOINTS
    ? process.env.KEEP_ENTRYPOINTS.split(';')
    : [
        'apps/web/src/routes/**/+page.{ts,js}',
        'apps/web/src/routes/**/+page.svelte',
        'apps/web/src/lib/**/*.{ts,js,svelte}',
        'apps/admin/src/routes/**/+page.{ts,js}',
        'apps/admin/src/routes/**/+page.svelte',
        'packages/**/*.{ts,js,svelte}'
      ];
  const ignore = [
    '**/*.test.*',
    '**/*.spec.*',
    '**/__tests__/**',
    '**/*.stories.*',
    '**/node_modules/**',
    '**/.svelte-kit/**',
    '**/dist/**',
    '**/build/**'
  ];
  const files = await globby(roots, { gitignore: true, ignore, absolute: true });

  const keep = new Set(files.map((f) => path.normalize(f)));
  const queue = [...keep];
  const seen = new Set(queue);

  while (queue.length) {
    const current = queue.pop();
    const deps = await extractImports(current);
    for (const d of deps) {
      if (!seen.has(d)) {
        seen.add(d);
        keep.add(d);
        queue.push(d);
      }
    }
  }

  const out = path.resolve(process.cwd(), '.artifacts/keep-list.json');
  await (await import('node:fs/promises')).mkdir(path.dirname(out), { recursive: true });
  await (await import('node:fs/promises')).writeFile(out, JSON.stringify([...keep].sort(), null, 2));
  console.log(`Wrote keep list: ${out} (count=${keep.size})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
