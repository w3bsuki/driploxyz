import { build } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  return `${value.toFixed(exponent === 0 ? 0 : 2)} ${units[exponent]}`;
}

async function walk(dir, relativeBase = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(relativeBase, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath, relativePath)));
    } else {
      const stat = await fs.stat(fullPath);
      files.push({ path: relativePath, size: stat.size });
    }
  }

  return files;
}

async function run() {
  // Provide default public env vars required for the build metrics SSR bundle.
  // These are non-secret placeholders that unblock the build pipeline when
  // the host environment hasn't supplied real values (e.g. CI dry runs).
  process.env.PUBLIC_SUPABASE_URL ??= 'https://placeholder.supabase.co';
  process.env.PUBLIC_SUPABASE_ANON_KEY ??= 'public-anon-key-placeholder';

  console.log('⏱️  Building web app with metrics...');
  await build({ configFile: path.join(projectRoot, 'vite.config.ts'), mode: 'production', root: projectRoot });

  const clientOutput = path.join(projectRoot, '.svelte-kit', 'output', 'client');
  const serverOutput = path.join(projectRoot, '.svelte-kit', 'output', 'server');

  const [clientFiles, serverFiles] = await Promise.all([
    walk(clientOutput),
    walk(serverOutput)
  ]);

  const totalClientSize = clientFiles.reduce((sum, file) => sum + file.size, 0);
  const totalServerSize = serverFiles.reduce((sum, file) => sum + file.size, 0);

  const topClientAssets = clientFiles.sort((a, b) => b.size - a.size).slice(0, 10);
  const topServerEntries = serverFiles.sort((a, b) => b.size - a.size).slice(0, 10);

  console.log('\n📦 Client bundle size:', formatBytes(totalClientSize));
  for (const asset of topClientAssets) {
    console.log(`  • ${asset.path} — ${formatBytes(asset.size)}`);
  }

  console.log('\n🧠 Server output size:', formatBytes(totalServerSize));
  for (const chunk of topServerEntries) {
    console.log(`  • ${chunk.path} — ${formatBytes(chunk.size)}`);
  }
}

run().catch((error) => {
  console.error('\nBuild metrics failed:', error);
  process.exitCode = 1;
});
