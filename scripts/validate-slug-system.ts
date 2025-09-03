#!/usr/bin/env tsx

/**
 * Validation script for the slug generation system
 * Tests all components to ensure they're working correctly
 */

import { createClient } from '@supabase/supabase-js';
import { 
  createSlug, 
  generateUniqueSlug, 
  isReservedSlug, 
  validateSlug,
  RESERVED_SLUGS
} from '../apps/web/src/lib/utils/slug';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

async function runTests() {
  console.log('🧪 Slug System Validation Tests');
  console.log('================================');
  
  let passed = 0;
  let failed = 0;
  
  function test(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name}${details ? ` - ${details}` : ''}`);
      failed++;
    }
  }
  
  // Test 1: Basic slug generation
  console.log('\n📝 Testing basic slug generation...');
  test('Simple title', createSlug('Hello World') === 'hello-world');
  test('Special characters', createSlug('Hello! @#$%^&*() World?') === 'hello-world');
  test('Multiple spaces', createSlug('Hello    World') === 'hello-world');
  test('Trailing/leading spaces', createSlug('  Hello World  ') === 'hello-world');
  test('Numbers and letters', createSlug('Product 123 ABC') === 'product-123-abc');
  test('Very short title', createSlug('Hi').startsWith('item-'));
  test('Empty title', createSlug('').startsWith('item-'));
  test('Long title truncation', createSlug('A'.repeat(100)).length <= 60);
  
  // Test 2: Reserved word detection
  console.log('\n🚫 Testing reserved word detection...');
  test('API reserved', isReservedSlug('api') === true);
  test('Admin reserved', isReservedSlug('admin') === true);
  test('Non-reserved word', isReservedSlug('my-awesome-product') === false);
  test('Case insensitive', isReservedSlug('API') === true);
  test('Custom reserved word', isReservedSlug('custom', ['custom']) === true);
  
  // Test 3: Slug validation
  console.log('\n✅ Testing slug validation...');
  const validSlug = validateSlug('valid-product-slug');
  test('Valid slug passes', validSlug.valid === true);
  
  const invalidSlug = validateSlug('-invalid-slug-');
  test('Invalid slug fails', invalidSlug.valid === false);
  
  const reservedSlug = validateSlug('admin');
  test('Reserved slug fails', reservedSlug.valid === false);
  
  const tooShort = validateSlug('ab');
  test('Too short fails', tooShort.valid === false);
  
  const specialChars = validateSlug('slug@with$special!');
  test('Special characters fail', specialChars.valid === false);
  
  // Test 4: Reserved slugs list completeness
  console.log('\n📋 Testing reserved slugs list...');
  const criticalSlugs = ['api', 'admin', 'auth', 'login', 'logout', 'signup', 'dashboard'];
  criticalSlugs.forEach(slug => {
    test(`${slug} is reserved`, RESERVED_SLUGS.has(slug));
  });
  
  test('Reserved list not empty', RESERVED_SLUGS.size > 0);
  test('Reserved list has core routes', RESERVED_SLUGS.size >= 40);
  
  // Test 5: Database integration (if available)
  if (supabaseUrl && supabaseServiceKey) {
    console.log('\n🗄️  Testing database integration...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    try {
      // Test unique slug generation
      const uniqueSlug = await generateUniqueSlug(supabase, 'Test Product Name');
      test('Unique slug generated', uniqueSlug.slug.length > 0);
      test('Result has proper structure', 
        typeof uniqueSlug.isUnique === 'boolean' && 
        typeof uniqueSlug.attempts === 'number'
      );
      
      // Test slug existence check (should not exist for random slug)
      const randomSlug = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const uniqueResult = await generateUniqueSlug(supabase, randomSlug);
      test('Random slug is unique', uniqueResult.isUnique === true);
      
    } catch (error) {
      test('Database connection', false, `${error}`);
    }
  } else {
    console.log('\n⚠️  Skipping database tests (no credentials)');
  }
  
  // Test 6: Edge cases
  console.log('\n🔄 Testing edge cases...');
  test('Null input handling', createSlug(null as any).startsWith('item-'));
  test('Undefined input handling', createSlug(undefined as any).startsWith('item-'));
  test('Number input handling', createSlug(123 as any).includes('123'));
  test('Unicode characters', createSlug('Продукт').length > 0);
  test('Emoji handling', createSlug('Product 😀 Test').length > 0);
  
  // Test 7: Performance considerations
  console.log('\n⚡ Testing performance...');
  const start = Date.now();
  for (let i = 0; i < 1000; i++) {
    createSlug(`Test Product ${i}`);
  }
  const duration = Date.now() - start;
  test('1000 slug generations under 100ms', duration < 100);
  
  // Final results
  console.log('\n🏁 Test Results');
  console.log('===============');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Slug system is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the slug system before deploying.');
    process.exit(1);
  }
}

// Additional utility: Show examples of slug generation
async function showExamples() {
  console.log('\n📚 Slug Generation Examples');
  console.log('============================');
  
  const examples = [
    'Nike Air Max 90',
    'Vintage Levi\'s 501 Jeans',
    'Apple MacBook Pro 13"',
    'Brand New Gucci Handbag!!!',
    'Size 8 Adidas Running Shoes',
    '2023 Limited Edition Sneakers',
    'Women\'s Summer Dress - Size M',
    'Детски обувки размер 25',  // Bulgarian
    'Продукт за тестване'       // Bulgarian
  ];
  
  examples.forEach(title => {
    const slug = createSlug(title);
    console.log(`"${title}" → "${slug}"`);
  });
}

// Run tests
if (process.argv.includes('--examples')) {
  showExamples();
} else {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}