#!/usr/bin/env node

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getDirectorySize(dir) {
  let totalSize = 0;
  
  try {
    const files = await readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const filePath = join(dir, file.name);
      
      if (file.isDirectory()) {
        totalSize += await getDirectorySize(filePath);
      } else {
        const stats = await stat(filePath);
        totalSize += stats.size;
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return totalSize;
}

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

async function analyzeBuild() {
  const buildDir = join(__dirname, '..', 'apps', 'web', '.svelte-kit');
  
  console.log('\n📦 Build Size Analysis\n');
  console.log('=' .repeat(50));
  
  try {
    // Check main build directory
    const totalSize = await getDirectorySize(buildDir);
    console.log(`\nTotal build size: ${formatBytes(totalSize)}`);
    
    // Check specific subdirectories
    const subdirs = ['output', 'generated', 'types'];
    
    console.log('\nBreakdown by directory:');
    for (const subdir of subdirs) {
      const subdirPath = join(buildDir, subdir);
      try {
        const size = await getDirectorySize(subdirPath);
        if (size > 0) {
          console.log(`  ${subdir}: ${formatBytes(size)}`);
        }
      } catch {
        // Directory might not exist
      }
    }
    
    // Performance recommendations
    console.log('\n💡 Optimization Tips:');
    
    if (totalSize > 10 * 1024 * 1024) { // > 10MB
      console.log('  ⚠️  Build size is large. Consider:');
      console.log('     - Code splitting with dynamic imports');
      console.log('     - Removing unused dependencies');
      console.log('     - Optimizing images and assets');
    } else if (totalSize > 5 * 1024 * 1024) { // > 5MB
      console.log('  ℹ️  Build size is moderate. Consider monitoring for growth.');
    } else {
      console.log('  ✅ Build size is optimal!');
    }
    
    console.log('\n' + '=' .repeat(50));
    
  } catch (error) {
    console.error('Error analyzing build:', error.message);
    console.log('\nMake sure to run "pnpm build" first!');
  }
}

analyzeBuild();