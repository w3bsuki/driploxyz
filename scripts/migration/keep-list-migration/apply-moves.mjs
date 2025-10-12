#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function main() {
  const dry = process.argv.includes('--dry');
  const manifestPath = path.resolve(process.cwd(), '.artifacts/move-manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

  let moved = 0;
  for (const [from, to] of Object.entries(manifest)) {
    if (path.normalize(from) === path.normalize(to)) continue;
    if (!dry) {
      await ensureDir(path.dirname(to));
      try {
        // Check if source exists before attempting move
        await fs.access(from);
        await fs.rename(from, to);
      } catch (e) {
        if (e.code === 'ENOENT') {
          console.warn(`Skipping ${from}: file not found`);
          continue;
        }
        if (e.code === 'EXDEV') {
          // cross-device fallback
          const data = await fs.readFile(from);
          await fs.writeFile(to, data);
          await fs.unlink(from);
        } else {
          throw e;
        }
      }
      // write shim at old path to reduce breakage
      const spec = to.replace(/\\/g, '/');
      const shim = `// shim: moved file\nexport * from '${spec}';\nexport { default } from '${spec}';\n`;
      await fs.writeFile(from, shim);
    }
    moved++;
  }
  console.log(`${dry ? 'Would move' : 'Moved'} ${moved} files`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
