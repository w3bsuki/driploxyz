#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * MCP-backed target mapping:
 * - SvelteKit project-structure: colocate single-use route components, keep shared in $lib
 * - SvelteKit server-only-modules: enforce $lib/server for server-only code
 * - Turborepo structure: apps/* and packages/* with clear boundaries
 */
function targetFor(oldPath) {
  const p = oldPath.replace(/\\/g, '/');
  let out = p;

  // SvelteKit apps: enforce $lib layout per MCP guidance
  if (p.includes('/apps/web/src/lib/')) {
    // Server-only code must live under $lib/server
    if (p.match(/\/(middleware|env|admin|session-server|secure|private)/i) && !p.includes('/lib/server/')) {
      out = p.replace('/lib/', '/lib/server/');
    }
    // Colocate route-specific components adjacent to their routes (MCP: "routing" guidance)
    // (For now, keep existing lib components; we'll audit usage next pass)
  }

  // Packages: enforce export structure per Turborepo guidance
  if (p.includes('/packages/core/src/')) {
    // Move framework-specific code out (MCP: best-practice for framework-agnostic packages)
    // (Will be handled in separate phase; for now keep)
  }
  if (p.includes('/packages/ui/src/')) {
    // Enforce src/lib/ structure for packaging (MCP: "packaging" guidance)
    if (!p.includes('/src/lib/') && p.match(/\/src\/(?!lib\/).+\.svelte$/)) {
      out = p.replace('/src/', '/src/lib/');
    }
  }

  // Normalize path separators for comparison safety
  return path.normalize(out);
}

async function main() {
  const keepPath = path.resolve(process.cwd(), '.artifacts/keep-list.json');
  const keep = JSON.parse(await fs.readFile(keepPath, 'utf8'));

  const moves = {};
  for (const file of keep) {
    const normFrom = path.normalize(file);
    const to = targetFor(normFrom);
    const normTo = path.normalize(to);
    if (normTo !== normFrom) moves[normFrom] = normTo;
  }

  const moveOut = path.resolve(process.cwd(), '.artifacts/move-manifest.json');
  await fs.writeFile(moveOut, JSON.stringify(moves, null, 2));
  console.log(`Wrote move manifest: ${moveOut} (moves=${Object.keys(moves).length})`);

  // Delete manifest = everything under apps/* and packages/* minus keep
  const all = new Set();
  const { globby } = await import('globby');
  const allFiles = await globby(['apps/**', 'packages/**'], {
    gitignore: true,
    absolute: true,
    ignore: ['**/node_modules/**', '**/.svelte-kit/**', '**/dist/**', '**/build/**']
  });
  allFiles.forEach((f) => all.add(path.normalize(f)));

  const keepSet = new Set(keep.map((f) => path.normalize(f)));
  const deletions = [...all].filter((f) => !keepSet.has(f));
  const deleteOut = path.resolve(process.cwd(), 'CLEANUP-DELETE-MANIFEST.json');
  await fs.writeFile(deleteOut, JSON.stringify(deletions.sort(), null, 2));
  console.log(`Wrote deletion manifest: ${deleteOut} (delete candidates=${deletions.length})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
