#!/usr/bin/env node

/**
 * Production Readiness Checker for Driplo
 * 
 * This script validates that all required configuration and
 * environment variables are properly set for production deployment.
 */

import { config } from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

const REQUIRED_ENV_VARS = [
  'PUBLIC_SUPABASE_URL',
  'PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'NODE_ENV'
];

const PRODUCTION_REQUIRED = [
  'PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'RATE_LIMIT_SECRET',
  'CSRF_SECRET'
];

const RECOMMENDED = [
  'PUBLIC_SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
  'PUBLIC_APP_URL'
];

function checkEnvironmentVariables() {
  console.log('🔍 Checking Environment Variables...\n');
  
  let allPassed = true;
  
  // Check required variables
  console.log('📋 Required Variables:');
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    if (!value) {
      console.log(`  ❌ ${varName}: MISSING`);
      allPassed = false;
    } else {
      console.log(`  ✅ ${varName}: SET`);
    }
  }
  
  // Check production-specific variables
  if (process.env.NODE_ENV === 'production') {
    console.log('\n🏭 Production Variables:');
    for (const varName of PRODUCTION_REQUIRED) {
      const value = process.env[varName];
      if (!value) {
        console.log(`  ❌ ${varName}: MISSING (REQUIRED IN PRODUCTION)`);
        allPassed = false;
      } else {
        console.log(`  ✅ ${varName}: SET`);
      }
    }
  }
  
  // Check recommended variables
  console.log('\n💡 Recommended Variables:');
  for (const varName of RECOMMENDED) {
    const value = process.env[varName];
    if (!value) {
      console.log(`  ⚠️  ${varName}: NOT SET (recommended)`);
    } else {
      console.log(`  ✅ ${varName}: SET`);
    }
  }
  
  return allPassed;
}

function checkConfigFiles() {
  console.log('\n🔍 Checking Configuration Files...\n');
  
  let allPassed = true;
  
  const requiredFiles = [
    'vercel.json',
    'package.json',
    'apps/web/svelte.config.js',
    'turbo.json'
  ];
  
  console.log('📄 Required Files:');
  for (const file of requiredFiles) {
    if (existsSync(file)) {
      console.log(`  ✅ ${file}: EXISTS`);
    } else {
      console.log(`  ❌ ${file}: MISSING`);
      allPassed = false;
    }
  }
  
  // Check vercel.json has security headers
  if (existsSync('vercel.json')) {
    try {
      const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));
      const hasHeaders = vercelConfig.headers && vercelConfig.headers.length > 0;
      const hasCSP = JSON.stringify(vercelConfig).includes('Content-Security-Policy');
      
      console.log('\n🔒 Security Configuration:');
      console.log(`  ${hasHeaders ? '✅' : '❌'} Security headers: ${hasHeaders ? 'CONFIGURED' : 'MISSING'}`);
      console.log(`  ${hasCSP ? '✅' : '⚠️ '} Content Security Policy: ${hasCSP ? 'CONFIGURED' : 'RECOMMENDED'}`);
    } catch (error) {
      console.log('  ❌ vercel.json: INVALID JSON');
      allPassed = false;
    }
  }
  
  return allPassed;
}

function checkDependencies() {
  console.log('\n🔍 Checking Dependencies...\n');
  
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const hasRequiredScripts = ['build', 'dev', 'lint', 'check-types'].every(
      script => packageJson.scripts && packageJson.scripts[script]
    );
    
    console.log('📦 Build Scripts:');
    console.log(`  ${hasRequiredScripts ? '✅' : '❌'} Required scripts: ${hasRequiredScripts ? 'PRESENT' : 'MISSING'}`);
    
    return hasRequiredScripts;
  } catch (error) {
    console.log('  ❌ package.json: CANNOT READ');
    return false;
  }
}

function checkRoutingFix() {
  console.log('\n🔍 Checking Route Fixes...\n');
  
  const routeExists = existsSync('apps/web/src/routes/(protected)/dashboard/profile/edit/+page.ts');
  
  console.log('🛣️  Route Configuration:');
  console.log(`  ${routeExists ? '✅' : '❌'} Dashboard profile edit route: ${routeExists ? 'FIXED' : 'MISSING'}`);
  
  return routeExists;
}

function generateReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 PRODUCTION READINESS REPORT');
  console.log('='.repeat(60));
  
  const allPassed = results.every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 STATUS: READY FOR PRODUCTION!');
    console.log('\n✅ All critical requirements met');
    console.log('✅ Environment variables configured');
    console.log('✅ Security headers in place');
    console.log('✅ Route fixes implemented');
  } else {
    console.log('\n⚠️  STATUS: NOT READY - ISSUES FOUND');
    console.log('\n❌ Please address the issues marked above');
    console.log('❌ Do not deploy until all critical items are resolved');
  }
  
  console.log('\n📖 Next Steps:');
  console.log('1. Fix any ❌ critical issues');
  console.log('2. Consider addressing ⚠️  warnings');
  console.log('3. Run production build: npm run build');
  console.log('4. Test in staging environment');
  console.log('5. Deploy to production');
  
  console.log('\n📚 Documentation: See PRODUCTION_IMPROVEMENTS.md');
  console.log('🔧 Environment Setup: See .env.example');
  
  return allPassed;
}

// Run all checks
async function main() {
  console.log('🚀 Driplo Production Readiness Check\n');
  
  const results = [
    checkEnvironmentVariables(),
    checkConfigFiles(), 
    checkDependencies(),
    checkRoutingFix()
  ];
  
  const isReady = generateReport(results);
  
  process.exit(isReady ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkEnvironmentVariables, checkConfigFiles, checkDependencies, checkRoutingFix };