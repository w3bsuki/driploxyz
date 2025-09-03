/**
 * Test the enhanced category translation system
 * This file can be used to validate translation fallbacks
 */

import { translateCategory, validateCategoryTranslations } from './mapping';

// Test categories from the database
const testCategories = [
  { name: 'Women', slug: 'women' },
  { name: 'Men', slug: 'men' },
  { name: 'Kids', slug: 'kids' },
  { name: 'Clothing', slug: 'women-clothing' },
  { name: 'Bags', slug: 'women-bags' },
  { name: 'Shoes', slug: 'women-shoes' },
  { name: 'Accessories', slug: 'women-accessories' },
  { name: 'Shirts & Blouses', slug: 'women-shirts-blouses' },
  { name: 'Pants & Jeans', slug: 'women-pants-jeans' },
  { name: 'Jackets & Coats', slug: 'women-jackets-coats' },
  { name: 'Sweaters & Hoodies', slug: 'women-sweaters-hoodies' },
  { name: 'Lingerie & Underwear', slug: 'women-lingerie-underwear' },
  { name: 'Handbags', slug: 'women-handbags' },
  { name: 'Crossbody', slug: 'women-crossbody' },
  { name: 'Totes', slug: 'women-totes' },
  { name: 'Clutches', slug: 'women-clutches' },
  // Test a category that doesn't have translation
  { name: 'UnknownCategory', slug: 'unknown-category' },
  { name: 'CamelCaseCategory', slug: 'camel-case-category' },
  { name: 'Special-Characters_Test', slug: 'special-test' }
];

/**
 * Test translation fallback system
 */
export function testTranslationFallbacks() {
  console.log('=== Category Translation Fallback Test ===\n');
  
  testCategories.forEach(category => {
    const translated = translateCategory(category.name, category.slug, { logMissing: false });
    console.log(`"${category.name}" -> "${translated}"`);
  });
  
  console.log('\n=== Translation Coverage Analysis ===\n');
  const validation = validateCategoryTranslations(testCategories);
  
  console.log(`Coverage: ${validation.coverage.toFixed(1)}%`);
  console.log(`Missing translations: ${validation.missing.length}`);
  
  if (validation.missing.length > 0) {
    console.log('\nMissing translations:');
    validation.missing.forEach(missing => {
      console.log(`  - "${missing.name}" (suggested key: ${missing.suggestedKey})`);
    });
  }
  
  console.log('\n=== Testing Edge Cases ===\n');
  
  // Test with null/undefined
  console.log(`null -> "${translateCategory(null)}"`);
  console.log(`undefined -> "${translateCategory(undefined)}"`);
  console.log(`empty string -> "${translateCategory('')}"`);
  
  // Test fallback options
  console.log(`\nWith fallbackToSlug disabled:`);
  console.log(`"UnknownCategory" -> "${translateCategory('UnknownCategory', 'unknown-category', { fallbackToSlug: false })}"`);
  
  return validation;
}

/**
 * Generate i18n message keys for missing translations
 */
export function generateMissingTranslationKeys(categories: Array<{name: string, slug?: string}>) {
  const validation = validateCategoryTranslations(categories);
  
  if (validation.missing.length === 0) {
    console.log('All categories have translations!');
    return;
  }
  
  console.log('=== Missing Translation Keys ===\n');
  console.log('Add these to your i18n message files:\n');
  
  // Generate Bulgarian translations (placeholder)
  console.log('// Bulgarian (bg.json):');
  validation.missing.forEach(missing => {
    const cleanName = missing.name
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    console.log(`"${missing.suggestedKey}": "${cleanName}",`);
  });
  
  console.log('\n// English (en.json):');
  validation.missing.forEach(missing => {
    const cleanName = missing.name
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    console.log(`"${missing.suggestedKey}": "${cleanName}",`);
  });
}

// Export test function for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testCategoryTranslations = testTranslationFallbacks;
  (window as any).generateCategoryTranslationKeys = () => generateMissingTranslationKeys(testCategories);
}