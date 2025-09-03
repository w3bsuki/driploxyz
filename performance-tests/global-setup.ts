/**
 * Global setup for performance testing
 * Prepares the test environment for consistent performance measurements
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up performance testing environment...\n');
  
  // Set up performance monitoring
  await setupPerformanceMonitoring();
  
  // Pre-warm application cache
  await preWarmApplication();
  
  // Clear any existing performance data
  await clearPerformanceData();
  
  console.log('✅ Performance testing environment ready\n');
}

/**
 * Set up performance monitoring and tracking
 */
async function setupPerformanceMonitoring() {
  console.log('📊 Initializing performance monitoring...');
  
  // Create performance data directory
  const fs = require('fs');
  const path = require('path');
  
  const perfDataDir = path.join(process.cwd(), 'performance-test-data');
  if (!fs.existsSync(perfDataDir)) {
    fs.mkdirSync(perfDataDir, { recursive: true });
  }
  
  // Initialize performance tracking files
  const perfLogFile = path.join(perfDataDir, 'performance-log.jsonl');
  const initialLog = JSON.stringify({
    timestamp: Date.now(),
    event: 'test_session_start',
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  }) + '\n';
  
  fs.writeFileSync(perfLogFile, initialLog);
  
  console.log('  ✓ Performance data directory created');
  console.log('  ✓ Performance logging initialized');
}

/**
 * Pre-warm the application to ensure consistent test results
 */
async function preWarmApplication() {
  console.log('🔥 Pre-warming application...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to key pages to warm up the application
    const pagesToWarm = [
      'http://localhost:5173/',
      'http://localhost:5173/search',
      'http://localhost:5173/search?q=test'
    ];
    
    for (const url of pagesToWarm) {
      console.log(`  • Warming ${url}`);
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000); // Allow time for JS to initialize
    }
    
    // Trigger filter modal to pre-load components
    await page.goto('http://localhost:5173/search');
    
    // Try to open filter modal if it exists
    try {
      const filterTrigger = await page.waitForSelector('[data-testid="filter-trigger"]', { timeout: 2000 });
      if (filterTrigger) {
        await filterTrigger.click();
        await page.waitForTimeout(1000);
        console.log('  ✓ Filter components pre-loaded');
      }
    } catch (e) {
      console.log('  ℹ Filter trigger not found (may not be implemented yet)');
    }
    
  } catch (error) {
    console.warn('  ⚠️ Pre-warming failed:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('  ✓ Application pre-warming completed');
}

/**
 * Clear existing performance data for clean test run
 */
async function clearPerformanceData() {
  console.log('🧹 Clearing previous performance data...');
  
  const fs = require('fs');
  const path = require('path');
  
  // Clear browser cache data
  const cacheDirectories = [
    'performance-test-results',
    '.lighthouse',
    'bundle-analysis-results.json'
  ];
  
  cacheDirectories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      if (fs.statSync(fullPath).isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`  ✓ Cleared ${dir} directory`);
      } else {
        fs.unlinkSync(fullPath);
        console.log(`  ✓ Cleared ${dir} file`);
      }
    }
  });
  
  // Set performance baseline
  const perfDataDir = path.join(process.cwd(), 'performance-test-data');
  const baselineFile = path.join(perfDataDir, 'baseline.json');
  
  const baseline = {
    timestamp: Date.now(),
    testSession: generateTestSessionId(),
    environment: {
      ci: !!process.env.CI,
      nodeVersion: process.version,
      platform: process.platform
    },
    budgets: {
      filterUpdateTime: 100,      // ms
      modalAnimationTime: 300,    // ms
      bottomSheetTransition: 250, // ms
      memoryHeapIncrease: 2,      // MB
      bundleSize: 50000          // bytes
    }
  };
  
  fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2));
  console.log('  ✓ Performance baseline established');
}

/**
 * Generate unique test session ID
 */
function generateTestSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `perf-${timestamp}-${random}`;
}

export default globalSetup;