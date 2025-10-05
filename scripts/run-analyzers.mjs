#!/usr/bin/env node

import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

// Create output directory
const outputDir = join(process.cwd(), 'analyzer-results');
mkdirSync(outputDir, { recursive: true });

console.log('🔍 Running static analyzers for Phase 7 cleanup...\n');

// Function to run a command and save its output
function runAnalyzer(name, command, outputFile) {
  console.log(`Running ${name}...`);
  try {
    const output = execSync(command, { encoding: 'utf8', cwd: process.cwd() });
    writeFileSync(join(outputDir, outputFile), output);
    console.log(`✅ ${name} completed. Results saved to ${outputFile}`);
    return { success: true, output };
  } catch (error) {
    const errorOutput = error.stdout || error.message;
    writeFileSync(join(outputDir, outputFile), errorOutput);
    console.log(`❌ ${name} failed. Error saved to ${outputFile}`);
    return { success: false, output: errorOutput };
  }
}

// Run knip to detect unused files/exports
runAnalyzer('knip', 'pnpm knip', 'knip-results.txt');

// Run ts-prune to detect unused TypeScript exports
runAnalyzer('ts-prune', 'pnpm ts-prune', 'ts-prune-results.txt');

// Run depcheck to find unused dependencies
runAnalyzer('depcheck', 'pnpm depcheck', 'depcheck-results.txt');

// Run jscpd to detect duplicate code
runAnalyzer('jscpd', 'pnpm jscpd . --threshold 0 --format json', 'jscpd-results.json');

// Run eslint with sonarjs to find code smells
runAnalyzer('eslint-sonarjs', 'pnpm eslint . --ext .js,.ts,.svelte --format json --output-file eslint-results.json', 'eslint-results.json');

// Run svelte-check for accessibility and diagnostics
runAnalyzer('svelte-check', 'pnpm svelte-check --workspace packages/ui,apps/web --output svelte-check-results.json', 'svelte-check-results.json');

console.log('\n🎉 All analyzers have been run. Results saved to analyzer-results/ directory');