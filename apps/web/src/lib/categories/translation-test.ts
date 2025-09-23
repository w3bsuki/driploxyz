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
  testCategories.forEach(category => {
    // Test translation but don't store result as it's just for testing
    translateCategory(category.name, category.slug, { logMissing: false });
  });

  const validation = validateCategoryTranslations(testCategories);

  if (validation.missing.length > 0) {
    validation.missing.forEach(() => {
      // Log missing translations if needed
    });
  }
  
  
  
  // Test with null/undefined
  
  
  
  
  // Test fallback options
  
  
  
  return validation;
}

/**
 * Generate i18n message keys for missing translations
 */
export function generateMissingTranslationKeys(categories: Array<{name: string, slug?: string}>) {
  const validation = validateCategoryTranslations(categories);
  
  if (validation.missing.length === 0) {
    
    return;
  }
  
  
  
  
  // Generate Bulgarian translations (placeholder)
  
  validation.missing.forEach(() => {
    // Generate clean name for Bulgarian translations (placeholder)
    // const cleanName = missing.name
    //   .replace(/([a-z])([A-Z])/g, '$1 $2')
    //   .replace(/[_-]/g, ' ')
    //   .replace(/\s+/g, ' ')
    //   .trim();
  });
}

// Export test function for use in browser console
if (typeof window !== 'undefined') {
  (window as unknown as { testCategoryTranslations: typeof testTranslationFallbacks; generateCategoryTranslationKeys: () => void }).testCategoryTranslations = testTranslationFallbacks;
  (window as unknown as { testCategoryTranslations: typeof testTranslationFallbacks; generateCategoryTranslationKeys: () => void }).generateCategoryTranslationKeys = () => generateMissingTranslationKeys(testCategories);
}