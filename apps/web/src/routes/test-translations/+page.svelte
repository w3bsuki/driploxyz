<script lang="ts">
  import { onMount } from 'svelte';
  import { translateCategory, validateCategoryTranslations } from '$lib/categories/mapping';
  import { testTranslationFallbacks, generateMissingTranslationKeys } from '$lib/categories/translation-test';
  
  // Sample database categories for testing
  const sampleCategories = [
    { name: 'Women', slug: 'women', id: '1' },
    { name: 'Men', slug: 'men', id: '2' },
    { name: 'Kids', slug: 'kids', id: '3' },
    { name: 'Clothing', slug: 'women-clothing', id: '4' },
    { name: 'Bags', slug: 'women-bags', id: '5' },
    { name: 'Accessories', slug: 'women-accessories', id: '6' },
    { name: 'Shirts & Blouses', slug: 'women-shirts-blouses', id: '7' },
    { name: 'Pants & Jeans', slug: 'women-pants-jeans', id: '8' },
    { name: 'Jackets & Coats', slug: 'women-jackets-coats', id: '9' },
    { name: 'Handbags', slug: 'women-handbags', id: '10' },
    { name: 'Crossbody', slug: 'women-crossbody', id: '11' },
    { name: 'UnknownCategory', slug: 'unknown-category', id: '12' },
    { name: 'CamelCaseTest', slug: 'camel-case-test', id: '13' },
    { name: 'Special-Characters_Test', slug: 'special-test', id: '14' }
  ];
  
  let validationResults = $state(null);
  let testResults = $state([]);
  
  onMount(() => {
    // Run validation
    validationResults = validateCategoryTranslations(sampleCategories);
    
    // Test translations
    testResults = sampleCategories.map(category => ({
      original: category.name,
      translated: translateCategory(category.name, category.slug, { logMissing: false }),
      slug: category.slug
    }));
    
    // Run console tests
    // Running category translation tests...
    testTranslationFallbacks();
    generateMissingTranslationKeys(sampleCategories);
  });
</script>

<div class="max-w-4xl mx-auto p-6">
  <h1 class="text-3xl font-bold mb-6">Category Translation Fallback System Test</h1>
  
  <div class="grid md:grid-cols-2 gap-6">
    <!-- Translation Examples -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <h2 class="text-xl font-semibold mb-4">Translation Examples</h2>
      <p class="text-sm text-gray-600 mb-4">
        Testing the fallback hierarchy: i18n key → direct mapping → cleaned name → slug
      </p>
      
      <div class="space-y-2">
        {#each testResults as result}
          <div class="flex justify-between items-center py-2 border-b border-gray-100">
            <div class="flex-1">
              <div class="font-medium text-sm">{result.original}</div>
              <div class="text-xs text-gray-500">{result.slug}</div>
            </div>
            <div class="text-right">
              <div class="font-medium text-green-600">{result.translated}</div>
              <div class="text-xs text-gray-400">
                {result.original === result.translated ? 'No fallback' : 'Fallback used'}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Validation Results -->
    <div class="bg-white rounded-lg shadow-sm border p-6">
      <h2 class="text-xl font-semibold mb-4">Translation Coverage</h2>
      
      {#if validationResults}
        <div class="space-y-4">
          <div class="flex justify-between">
            <span>Coverage:</span>
            <span class="font-semibold {validationResults.coverage >= 80 ? 'text-green-600' : 'text-orange-600'}">
              {validationResults.coverage.toFixed(1)}%
            </span>
          </div>
          
          <div class="flex justify-between">
            <span>Missing translations:</span>
            <span class="font-semibold text-red-600">{validationResults.missing.length}</span>
          </div>
          
          {#if validationResults.missing.length > 0}
            <div>
              <h3 class="font-medium text-sm mb-2">Missing translation keys:</h3>
              <div class="bg-gray-50 rounded p-3 text-xs space-y-1">
                {#each validationResults.missing as missing}
                  <div class="font-mono text-gray-700">
                    "{missing.suggestedKey}": "{missing.name}"
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
  
  <!-- Fallback Hierarchy Info -->
  <div class="mt-8 bg-blue-50 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Fallback Hierarchy</h2>
    <ol class="list-decimal list-inside space-y-2 text-sm">
      <li><strong>Primary:</strong> i18n message key (category_&lt;slugifiedName&gt;)</li>
      <li><strong>Secondary:</strong> Direct mapping translation from legacy system</li>
      <li><strong>Tertiary:</strong> Cleaned database name (spaces added, special chars normalized)</li>
      <li><strong>Last Resort:</strong> Generated slug converted to display format</li>
    </ol>
  </div>
  
  <!-- Edge Case Testing -->
  <div class="mt-8 bg-gray-50 rounded-lg p-6">
    <h2 class="text-xl font-semibold mb-4">Edge Case Testing</h2>
    <div class="grid md:grid-cols-3 gap-4 text-sm">
      <div>
        <h3 class="font-medium mb-2">Null/Undefined:</h3>
        <code class="block bg-white p-2 rounded">
          null → "{translateCategory(null)}"<br>
          undefined → "{translateCategory(undefined)}"<br>
          "" → "{translateCategory('')}"
        </code>
      </div>
      
      <div>
        <h3 class="font-medium mb-2">CamelCase:</h3>
        <code class="block bg-white p-2 rounded">
          "CamelCaseTest" → "{translateCategory('CamelCaseTest', 'camel-case-test')}"
        </code>
      </div>
      
      <div>
        <h3 class="font-medium mb-2">Special Characters:</h3>
        <code class="block bg-white p-2 rounded">
          "Special-Chars_Test" → "{translateCategory('Special-Chars_Test', 'special-test')}"
        </code>
      </div>
    </div>
  </div>
  
  <div class="mt-8 text-center text-sm text-gray-500">
    <p>Check the browser console for detailed test results and suggested i18n keys.</p>
    <p>Run <code>testCategoryTranslations()</code> or <code>generateCategoryTranslationKeys()</code> in the console.</p>
  </div>
</div>

<style>
  code {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
    font-size: 0.875rem;
  }
</style>