#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

function targetFor(oldPath) {
  // Heuristic target mapping based on desired structure
  const p = oldPath.replace(/\\/g, '/');
  if (p.includes('/apps/web/src/routes/')) return p; // already colocated
  if (p.includes('/apps/web/src/lib/components/')) return p; // keep for now
  if (p.includes('/apps/web/src/lib/server/')) return p; // already correct
  if (p.includes('/apps/admin/')) return p; // admin unchanged for now
  if (p.includes('/packages/ui/src')) return p; // package stays put
  if (p.includes('/packages/core/src')) return p; // stays but will split later
  if (p.includes('/packages/domain/src')) return p; // stays
  // default: no move
  return p;
}

async function main() {
  const keepPath = path.resolve(process.cwd(), '.artifacts/keep-list.json');
  const keep = JSON.parse(await fs.readFile(keepPath, 'utf8'));

  const moves = {};
  for (const file of keep) {
    const to = targetFor(file);
    if (to !== file) moves[file] = to;
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
