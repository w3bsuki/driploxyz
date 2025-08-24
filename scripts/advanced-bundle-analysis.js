#!/usr/bin/env node

import { readdir, stat, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getDirectorySize(dir) {
  let totalSize = 0;
  const files = [];
  
  try {
    const dirFiles = await readdir(dir, { withFileTypes: true });
    
    for (const file of dirFiles) {
      const filePath = join(dir, file.name);
      
      if (file.isDirectory()) {
        const { size, fileList } = await getDirectorySize(filePath);
        totalSize += size;
        files.push(...fileList);
      } else {
        const stats = await stat(filePath);
        totalSize += stats.size;
        files.push({
          path: filePath,
          size: stats.size,
          name: file.name,
          ext: extname(file.name)
        });
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return { size: totalSize, fileList: files };
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

function analyzeFileTypes(files) {
  const typeAnalysis = {};
  
  files.forEach(file => {
    const ext = file.ext || 'no-extension';
    if (!typeAnalysis[ext]) {
      typeAnalysis[ext] = {
        count: 0,
        totalSize: 0,
        files: []
      };
    }
    
    typeAnalysis[ext].count++;
    typeAnalysis[ext].totalSize += file.size;
    typeAnalysis[ext].files.push(file);
  });
  
  return typeAnalysis;
}

function findLargestFiles(files, limit = 10) {
  return files
    .sort((a, b) => b.size - a.size)
    .slice(0, limit);
}

async function analyzeJSChunks(buildDir) {
  const clientDir = join(buildDir, 'output', 'client');
  
  try {
    const { fileList } = await getDirectorySize(clientDir);
    const jsFiles = fileList.filter(file => file.ext === '.js');
    
    console.log('\n📦 JavaScript Chunk Analysis');
    console.log('='.repeat(50));
    
    if (jsFiles.length === 0) {
      console.log('No JS files found in client output');
      return;
    }
    
    const totalJSSize = jsFiles.reduce((acc, file) => acc + file.size, 0);
    console.log(`\nTotal JS size: ${formatBytes(totalJSSize)}`);
    console.log(`Number of chunks: ${jsFiles.length}\n`);
    
    // Categorize chunks
    const chunks = {
      entry: jsFiles.filter(f => f.name.includes('entry')),
      vendor: jsFiles.filter(f => f.name.includes('vendor') || f.name.includes('chunk')),
      app: jsFiles.filter(f => f.name.includes('app') || f.name.includes('page')),
      other: jsFiles.filter(f => !f.name.includes('entry') && !f.name.includes('vendor') && !f.name.includes('chunk') && !f.name.includes('app') && !f.name.includes('page'))
    };
    
    Object.entries(chunks).forEach(([category, files]) => {
      if (files.length > 0) {
        const categorySize = files.reduce((acc, file) => acc + file.size, 0);
        console.log(`${category.toUpperCase()} chunks: ${formatBytes(categorySize)} (${files.length} files)`);
        
        files.sort((a, b) => b.size - a.size).slice(0, 3).forEach(file => {
          console.log(`  - ${file.name}: ${formatBytes(file.size)}`);
        });
        console.log('');
      }
    });
    
    return totalJSSize;
  } catch (error) {
    console.error('Error analyzing JS chunks:', error.message);
  }
}

async function analyzeBuild() {
  const buildDir = join(__dirname, '..', 'apps', 'web', '.svelte-kit');
  
  console.log('\n🔍 Advanced Build Analysis\n');
  console.log('='.repeat(60));
  
  try {
    const { size: totalSize, fileList } = await getDirectorySize(buildDir);
    console.log(`\nTotal build size: ${formatBytes(totalSize)}`);
    
    // File type analysis
    const typeAnalysis = analyzeFileTypes(fileList);
    
    console.log('\n📊 File Type Breakdown:');
    Object.entries(typeAnalysis)
      .sort(([,a], [,b]) => b.totalSize - a.totalSize)
      .slice(0, 10)
      .forEach(([ext, data]) => {
        console.log(`  ${ext}: ${formatBytes(data.totalSize)} (${data.count} files)`);
      });
    
    // Largest files
    console.log('\n📈 Largest Files:');
    const largestFiles = findLargestFiles(fileList, 15);
    largestFiles.forEach((file, i) => {
      const relativePath = file.path.split('.svelte-kit')[1] || file.path;
      console.log(`  ${i + 1}. ${relativePath}: ${formatBytes(file.size)}`);
    });
    
    // JavaScript chunk analysis
    await analyzeJSChunks(buildDir);
    
    // Performance recommendations
    console.log('\n💡 Performance Recommendations:');
    
    const jsSize = typeAnalysis['.js']?.totalSize || 0;
    const cssSize = typeAnalysis['.css']?.totalSize || 0;
    const mapSize = typeAnalysis['.map']?.totalSize || 0;
    
    if (jsSize > 500 * 1024) { // > 500KB
      console.log('  ⚠️  JavaScript bundle is large (>500KB):');
      console.log('     - Implement more aggressive code splitting');
      console.log('     - Use dynamic imports for heavy components');
      console.log('     - Consider tree shaking optimization');
    } else if (jsSize > 200 * 1024) { // > 200KB
      console.log('  ⚠️  JavaScript bundle is moderate (>200KB):');
      console.log('     - Consider lazy loading non-critical components');
      console.log('     - Verify all imports are necessary');
    } else {
      console.log('  ✅ JavaScript bundle size is optimal!');
    }
    
    if (cssSize > 100 * 1024) { // > 100KB
      console.log('  ⚠️  CSS bundle is large:');
      console.log('     - Check for unused CSS rules');
      console.log('     - Consider CSS purging');
    }
    
    if (mapSize > 1024 * 1024) { // > 1MB
      console.log('  ℹ️  Source maps are large (only affects development)');
    }
    
    // Bundle size score
    const score = calculatePerformanceScore(jsSize, cssSize, totalSize);
    console.log(`\n📊 Performance Score: ${score}/100`);
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('Error analyzing build:', error.message);
    console.log('\nMake sure to run "pnpm build --filter web" first!');
  }
}

function calculatePerformanceScore(jsSize, cssSize, totalSize) {
  let score = 100;
  
  // Penalize large JS bundles
  if (jsSize > 200 * 1024) score -= 20;
  if (jsSize > 500 * 1024) score -= 30;
  
  // Penalize large CSS bundles
  if (cssSize > 100 * 1024) score -= 10;
  
  // Penalize large total size
  if (totalSize > 5 * 1024 * 1024) score -= 15;
  if (totalSize > 10 * 1024 * 1024) score -= 25;
  
  return Math.max(0, score);
}

analyzeBuild();