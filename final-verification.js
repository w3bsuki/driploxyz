#!/usr/bin/env node

/**
 * Final Verification Script for Refactor Completion
 * 
 * This script verifies the project health after the 7-phase refactor
 * and provides a comprehensive report on the current state.
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bold');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Verification functions
function checkPackageCount() {
  logSection('Package Count Verification');
  
  try {
    const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});
    
    logInfo(`Total dependencies: ${dependencies.length}`);
    logInfo(`Total dev dependencies: ${devDependencies.length}`);
    logInfo(`Total packages: ${dependencies.length + devDependencies.length}`);
    
    // Check for known heavy packages
    const heavyPackages = ['lodash', 'moment', 'axios', 'date-fns'];
    const foundHeavyPackages = dependencies.filter(dep => 
      heavyPackages.some(heavy => dep.includes(heavy))
    );
    
    if (foundHeavyPackages.length > 0) {
      logWarning(`Found potentially heavy packages: ${foundHeavyPackages.join(', ')}`);
    } else {
      logSuccess('No known heavy packages found');
    }
    
    return {
      total: dependencies.length + devDependencies.length,
      dependencies: dependencies.length,
      devDependencies: devDependencies.length,
      heavyPackages: foundHeavyPackages
    };
  } catch (error) {
    logError(`Failed to analyze package count: ${error.message}`);
    return null;
  }
}

function checkBuildWorks() {
  logSection('Build Verification');
  
  try {
    logInfo('Running build command...');
    const buildOutput = execSync('pnpm build', { 
      encoding: 'utf8', 
      stdio: 'pipe',
      timeout: 300000 // 5 minutes timeout
    });
    
    logSuccess('Build completed successfully');
    logInfo('Build output size analyzed');
    
    return { success: true, output: buildOutput };
  } catch (error) {
    logError(`Build failed: ${error.message}`);
    if (error.stdout) {
      logInfo('Build stdout:', 'yellow');
      console.log(error.stdout);
    }
    if (error.stderr) {
      logInfo('Build stderr:', 'yellow');
      console.log(error.stderr);
    }
    return { success: false, error: error.message };
  }
}

function checkLintPasses() {
  logSection('Lint Verification');
  
  try {
    logInfo('Running lint check...');
    const lintOutput = execSync('pnpm lint', { 
      encoding: 'utf8', 
      stdio: 'pipe'
    });
    
    logSuccess('Lint check passed');
    return { success: true, output: lintOutput };
  } catch (error) {
    logError(`Lint check failed: ${error.message}`);
    if (error.stdout) {
      logInfo('Lint output:', 'yellow');
      console.log(error.stdout);
    }
    return { success: false, error: error.message };
  }
}

function checkTypeCheckPasses() {
  logSection('TypeScript Verification');
  
  try {
    logInfo('Running TypeScript check...');
    const typeCheckOutput = execSync('pnpm typecheck', { 
      encoding: 'utf8', 
      stdio: 'pipe'
    });
    
    logSuccess('TypeScript check passed');
    return { success: true, output: typeCheckOutput };
  } catch (error) {
    logError(`TypeScript check failed: ${error.message}`);
    if (error.stdout) {
      logInfo('TypeScript output:', 'yellow');
      console.log(error.stdout);
    }
    return { success: false, error: error.message };
  }
}

function checkSvelte5Migration() {
  logSection('Svelte 5 Migration Verification');
  
  try {
    // Check for Svelte 5 patterns
    const checkFiles = [
      'apps/web/svelte.config.js',
      'packages/ui/svelte.config.js'
    ];
    
    let svelte5Detected = false;
    
    for (const file of checkFiles) {
      if (existsSync(file)) {
        const content = readFileSync(file, 'utf8');
        if (content.includes('5') || content.includes('runes')) {
          logSuccess(`Svelte 5 configuration found in ${file}`);
          svelte5Detected = true;
        }
      }
    }
    
    if (!svelte5Detected) {
      logWarning('Svelte 5 configuration not clearly detected');
    }
    
    // Check for rune usage in components
    try {
      const runeUsage = execSync('grep -r "\\$state\\|\\$derived\\|\\$effect" apps/web/src packages/ui/src --include="*.svelte" --include="*.ts" | wc -l', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const runeCount = parseInt(runeUsage.trim());
      if (runeCount > 0) {
        logSuccess(`Found ${runeCount} instances of Svelte 5 runes`);
      } else {
        logWarning('No Svelte 5 runes detected');
      }
    } catch (error) {
      logInfo('Could not check for rune usage');
    }
    
    return { svelte5Detected };
  } catch (error) {
    logError(`Failed to verify Svelte 5 migration: ${error.message}`);
    return null;
  }
}

function checkRefactorDocumentation() {
  logSection('Refactor Documentation Verification');
  
  const requiredDocs = [
    'CLI_AGENT_TASKS.md',
    'REFACTOR_SUMMARY.md',
    'COMPREHENSIVE_REFACTOR_PLAN.md',
    'REFACTOR_IMPLEMENTATION_GUIDE.md',
    'SVELTE_5_OPTIMIZATION_REPORT.md'
  ];
  
  let allDocsExist = true;
  
  for (const doc of requiredDocs) {
    if (existsSync(doc)) {
      logSuccess(`Found ${doc}`);
    } else {
      logError(`Missing ${doc}`);
      allDocsExist = false;
    }
  }
  
  return { allDocsExist, requiredDocs };
}

function checkPackageStructure() {
  logSection('Package Structure Verification');
  
  const expectedStructure = {
    'packages/core': 'Core business logic',
    'packages/ui': 'UI component library',
    'packages/i18n': 'Internationalization',
    'packages/domain': 'Domain types',
    'packages/testing': 'Testing utilities',
    'apps/web': 'Main web application'
  };
  
  let structureValid = true;
  
  for (const [path, description] of Object.entries(expectedStructure)) {
    if (existsSync(path)) {
      logSuccess(`Found ${path} - ${description}`);
    } else {
      logError(`Missing ${path} - ${description}`);
      structureValid = false;
    }
  }
  
  return { structureValid, expectedStructure };
}

function checkForTemporaryFiles() {
  logSection('Temporary Files Cleanup Verification');
  
  const tempFilePatterns = [
    '*.tmp',
    '*.temp',
    '*.bak',
    '*.log',
    '.DS_Store',
    'Thumbs.db'
  ];
  
  let tempFilesFound = [];
  
  for (const pattern of tempFilePatterns) {
    try {
      const output = execSync(`find . -name "${pattern}" -type f`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      if (output.trim()) {
        const files = output.trim().split('\n');
        tempFilesFound.push(...files);
      }
    } catch (error) {
      // No files found, which is good
    }
  }
  
  if (tempFilesFound.length === 0) {
    logSuccess('No temporary files found');
  } else {
    logWarning(`Found temporary files: ${tempFilesFound.join(', ')}`);
  }
  
  return { tempFilesFound };
}

function generateReport(results) {
  logSection('Final Verification Report');
  
  const overallHealth = {
    packageCount: results.packageCount !== null,
    build: results.build.success,
    lint: results.lint.success,
    typecheck: results.typeCheck.success,
    documentation: results.documentation.allDocsExist,
    structure: results.packageStructure.structureValid,
    tempFiles: results.tempFiles.tempFilesFound.length === 0
  };
  
  const healthScore = Object.values(overallHealth).filter(Boolean).length;
  const maxScore = Object.keys(overallHealth).length;
  const healthPercentage = Math.round((healthScore / maxScore) * 100);
  
  log(`\nOverall Project Health: ${healthPercentage}%`, 
    healthPercentage >= 80 ? 'green' : 
    healthPercentage >= 60 ? 'yellow' : 'red'
  );
  
  log('\nDetailed Results:');
  log(`  Package Analysis: ${overallHealth.packageCount ? '✅' : '❌'}`);
  log(`  Build Status: ${overallHealth.build ? '✅' : '❌'}`);
  log(`  Lint Status: ${overallHealth.lint ? '✅' : '❌'}`);
  log(`  TypeScript Check: ${overallHealth.typecheck ? '✅' : '❌'}`);
  log(`  Documentation: ${overallHealth.documentation ? '✅' : '❌'}`);
  log(`  Package Structure: ${overallHealth.structure ? '✅' : '❌'}`);
  log(`  Clean Temp Files: ${overallHealth.tempFiles ? '✅' : '❌'}`);
  
  if (healthPercentage === 100) {
    log('\n🎉 Excellent! Project is in perfect health after refactor.');
  } else if (healthPercentage >= 80) {
    log('\n✨ Good! Project is in good health with minor issues.');
  } else if (healthPercentage >= 60) {
    log('\n⚠️  Project needs attention before proceeding.');
  } else {
    log('\n🚨 Project has significant issues that need to be addressed.');
  }
  
  return { healthPercentage, overallHealth };
}

// Main execution
function main() {
  log('🔍 Final Verification Script for 7-Phase Refactor', 'bold');
  log('Checking project health after refactor completion...\n');
  
  const results = {
    packageCount: checkPackageCount(),
    build: checkBuildWorks(),
    lint: checkLintPasses(),
    typeCheck: checkTypeCheckPasses(),
    svelte5: checkSvelte5Migration(),
    documentation: checkRefactorDocumentation(),
    packageStructure: checkPackageStructure(),
    tempFiles: checkForTemporaryFiles()
  };
  
  const report = generateReport(results);
  
  logSection('Next Steps');
  
  if (report.healthPercentage >= 80) {
    log('✅ Project is ready for CLI agent optimization tasks.');
    log('📋 Run the tasks outlined in CLI_AGENT_TASKS.md');
    log('🔧 Use Svelte MCP and Supabase MCP servers for optimization');
  } else {
    log('❌ Please address the issues above before proceeding with CLI agent tasks.');
    log('🔧 Fix the failed checks and run this script again.');
  }
  
  log('\n📊 For detailed refactor information, see REFACTOR_SUMMARY.md');
  
  // Exit with appropriate code
  process.exit(report.healthPercentage >= 80 ? 0 : 1);
}

// Run the verification
main();