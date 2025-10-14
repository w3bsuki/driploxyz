#!/usr/bin/env node

import { execSync } from 'child_process';
import { parseArgs } from 'node:util';

const args = parseArgs({
  args: process.argv.slice(2),
  options: {
    suite: {
      type: 'string',
      description: 'Test suite to run'
    },
    ui: {
      type: 'boolean',
      description: 'Run tests in UI mode'
    },
    headed: {
      type: 'boolean',
      description: 'Run tests with headed browser'
    },
    debug: {
      type: 'boolean',
      description: 'Run tests in debug mode'
    },
    grep: {
      type: 'string',
      description: 'Filter tests by pattern'
    },
    project: {
      type: 'string',
      description: 'Run tests on specific project'
    },
    'update-snapshots': {
      type: 'boolean',
      description: 'Update snapshots'
    },
    'trace': {
      type: 'string',
      description: 'Trace mode: on, off, on-first-retry'
    }
  },
  allowPositional: true
});

const testSuites = {
  // Core functionality
  auth: 'auth.spec.ts',
  search: 'search.spec.ts', 
  checkout: 'checkout.spec.ts',
  a11y: 'a11y.spec.ts',
  localization: 'localization.spec.ts',
  onboarding: 'onboarding.spec.ts',
  
  // Comprehensive tests
  selling: 'selling.spec.ts',
  dashboard: 'dashboard.spec.ts',
  messaging: 'messaging.spec.ts',
  payments: 'payments.spec.ts',
  mobile: 'mobile.spec.ts',
  'error-handling': 'error-handling.spec.ts',
  accessibility: 'accessibility-comprehensive.spec.ts',
  
  // Combined suites
  critical: 'auth.spec.ts search.spec.ts checkout.spec.ts selling.spec.ts payments.spec.ts',
  user: 'auth.spec.ts dashboard.spec.ts messaging.spec.ts payments.spec.ts',
  seller: 'auth.spec.ts selling.spec.ts dashboard.spec.ts messaging.spec.ts',
  'full-coverage': 'auth.spec.ts search.spec.ts checkout.spec.ts a11y.spec.ts localization.spec.ts onboarding.spec.ts selling.spec.ts dashboard.spec.ts messaging.spec.ts payments.spec.ts mobile.spec.ts error-handling.spec.ts accessibility-comprehensive.spec.ts'
};

function buildCommand() {
  let command = 'pnpm exec playwright test';
  
  // Add test files
  if (args.values.suite) {
    const suiteFiles = testSuites[args.values.suite];
    if (suiteFiles) {
      command += ` ${suiteFiles}`;
    } else {
      console.error(`Unknown test suite: ${args.values.suite}`);
      console.log('Available suites:', Object.keys(testSuites).join(', '));
      process.exit(1);
    }
  }
  
  // Add options
  if (args.values.ui) {
    command += ' --ui';
  }
  
  if (args.values.headed) {
    command += ' --headed';
  }
  
  if (args.values.debug) {
    command += ' --debug';
  }
  
  if (args.values.grep) {
    command += ` --grep "${args.values.grep}"`;
  }
  
  if (args.values.project) {
    command += ` --project "${args.values.project}"`;
  }
  
  if (args.values['update-snapshots']) {
    command += ' --update-snapshots';
  }
  
  if (args.values.trace) {
    command += ` --trace ${args.values.trace}`;
  }
  
  // Add positional arguments
  if (args.positional.length > 0) {
    command += ` ${args.positional.join(' ')}`;
  }
  
  return command;
}

function showHelp() {
  console.log(`
Test Runner Script

Usage: node run-tests.mjs [options] [test-files...]

Options:
  --suite <name>        Run predefined test suite
  --ui                  Run tests in UI mode
  --headed              Run tests with headed browser
  --debug               Run tests in debug mode
  --grep <pattern>      Filter tests by pattern
  --project <name>      Run tests on specific project
  --update-snapshots    Update snapshots
  --trace <mode>        Trace mode (on, off, on-first-retry)
  --help                Show this help

Available Test Suites:
  auth                  Authentication tests
  search                Search functionality tests
  checkout              Checkout flow tests
  a11y                  Basic accessibility tests
  localization          Internationalization tests
  onboarding            User onboarding tests
  selling               Product selling tests
  dashboard             Dashboard tests
  messaging             Messaging tests
  payments              Payment tests
  mobile                Mobile tests
  error-handling        Error handling tests
  accessibility         Comprehensive accessibility tests
  critical              Critical path tests
  user                  User-focused tests
  seller                Seller-focused tests
  full-coverage         All tests

Examples:
  node run-tests.mjs --suite auth
  node run-tests.mjs --suite critical --ui
  node run-tests.mjs --suite mobile --project mobile-chrome
  node run-tests.mjs --grep "should login" --debug
  node run-tests.mjs --trace on-first-retry
  `);
}

if (args.values.help || process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

const command = buildCommand();
console.log(`Running: ${command}`);

try {
  execSync(command, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
} catch (error) {
  console.error('Test execution failed');
  process.exit(1);
}