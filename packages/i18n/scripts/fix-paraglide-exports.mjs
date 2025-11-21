#!/usr/bin/env node
/**
 * Fix invalid ESM export alias syntax emitted by Paraglide-generated files
 * Rewrites: export { foo as "Bar" }  -> export { foo as Bar }
 * Only touches files under packages/i18n/paraglide and packages/i18n/src/paraglide
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve script directory reliably on Windows too
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
// ROOT points to packages/i18n
const TARGET_DIRS = [
  path.join(ROOT, 'paraglide'),
  path.join(ROOT, 'src', 'paraglide'),
  path.join(ROOT, 'lib', 'src', 'paraglide')
];

/** @param {string} file */
function fixFile(file) {
  const text = fs.readFileSync(file, 'utf8');
  // Quick check to skip if no quoted alias pattern exists
  if (!/export\s*\{[^}]*as\s*"[^"]+"\s*\}/.test(text)) return false;
  const fixed = text.replace(/export\s*\{\s*([^\s{}]+)\s+as\s+"([^"]+)"\s*\}/g, (m, sym, alias) => {
    // Ensure alias is a valid identifier; if not, convert to camelCase and strip invalid chars
    const safe = alias
      .replace(/[^$\w]/g, ' ') // non-identifier -> space
      .replace(/\s+(\w)/g, (_, c) => c.toUpperCase()) // camelize word starts
      .replace(/\s+/g, '')
      .replace(/^\d+/, ''); // don't start with digit
    if (!safe) return `export { ${sym} }`;
    return `export { ${sym} as ${safe} }`;
  });
  if (fixed !== text) {
    fs.writeFileSync(file, fixed, 'utf8');
    return true;
  }
  return false;
}

/** @param {string} dir */
function walk(dir) {
  let changed = 0;
  if (!fs.existsSync(dir)) return changed;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      changed += walk(p);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      if (fixFile(p)) changed++;
    }
  }
  return changed;
}

let total = 0;
for (const d of TARGET_DIRS) total += walk(d);
console.log(`Fixed ${total} Paraglide export alias issue(s).`);
