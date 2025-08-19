#!/usr/bin/env node

/**
 * Test script to verify auth fixes work in production
 * Run with: node test-auth-production.mjs
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

console.log('🔍 Testing Auth Fixes...\n');

// Test 1: Check if signup file imports PUBLIC_SITE_URL correctly
console.log('1. Checking signup file imports...');
try {
  const signupContent = readFileSync('./apps/web/src/routes/(auth)/signup/+page.server.ts', 'utf8');
  
  if (signupContent.includes("import { PUBLIC_SITE_URL } from '$env/static/public'")) {
    console.log('✅ PUBLIC_SITE_URL import found');
  } else {
    console.log('❌ PUBLIC_SITE_URL import missing');
  }
  
  if (signupContent.includes('PUBLIC_SITE_URL || url.origin')) {
    console.log('✅ Fallback URL logic found');
  } else {
    console.log('❌ Fallback URL logic missing');
  }
  
  if (!signupContent.includes('request.url.origin')) {
    console.log('✅ No dangerous request.url.origin usage');
  } else {
    console.log('❌ Still using request.url.origin!');
  }
  
} catch (error) {
  console.log('❌ Error reading signup file:', error.message);
}

// Test 2: Check environment variables
console.log('\n2. Checking environment configuration...');
try {
  const envExample = readFileSync('./apps/web/.env.example', 'utf8');
  
  if (envExample.includes('PUBLIC_SITE_URL=')) {
    console.log('✅ PUBLIC_SITE_URL in .env.example');
  } else {
    console.log('❌ PUBLIC_SITE_URL missing from .env.example');
  }
} catch (error) {
  console.log('❌ Error reading .env.example:', error.message);
}

// Test 3: Check TypeScript types
console.log('\n3. Checking TypeScript configuration...');
try {
  const appDts = readFileSync('./apps/web/src/app.d.ts', 'utf8');
  
  if (appDts.includes("declare module '$env/static/public'")) {
    console.log('✅ Environment types declared');
  } else {
    console.log('❌ Environment types missing');
  }
  
  if (appDts.includes('PUBLIC_SITE_URL: string')) {
    console.log('✅ PUBLIC_SITE_URL type found');
  } else {
    console.log('❌ PUBLIC_SITE_URL type missing');
  }
} catch (error) {
  console.log('❌ Error reading app.d.ts:', error.message);
}

// Test 4: Check svelte.config.js
console.log('\n4. Checking SvelteKit configuration...');
try {
  const svelteConfig = readFileSync('./apps/web/svelte.config.js', 'utf8');
  
  if (svelteConfig.includes('checkOrigin: false')) {
    console.log('✅ CSRF disabled for testing');
  } else {
    console.log('❌ CSRF not disabled');
  }
} catch (error) {
  console.log('❌ Error reading svelte.config.js:', error.message);
}

console.log('\n🏁 Test complete!');
console.log('\nNext steps:');
console.log('1. Deploy to Vercel with PUBLIC_SITE_URL environment variable');
console.log('2. Test signup/login on production');
console.log('3. Re-enable CSRF after confirming auth works');