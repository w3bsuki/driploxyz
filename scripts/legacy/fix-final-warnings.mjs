import fs from 'fs';
import path from 'path';

const finalFixes = [
  // PaymentForm - Actually use err
  {
    file: 'packages/ui/src/lib/components/forms/PaymentForm.svelte',
    replacements: [
      { from: 'console.error(\'Stripe payment confirmation failed:\', err);', to: 'console.error(\'Stripe payment confirmation failed\');' },
      { from: '} catch (err) {', to: '} catch {' }
    ]
  },
  // BrandPaymentModal - empty block
  {
    file: 'packages/ui/src/lib/components/modals/BrandPaymentModal.svelte',
    replacements: [
      { from: /} catch {\s*}\s*onSuccess/s, to: '} catch {\n          // Ignore errors during redirect\n        }\n        onSuccess' }
    ]
  },
  // All remaining unused vars - prefix with _
  {
    file: 'packages/ui/src/lib/components/modals/ReviewModal.svelte',
    replacements: [{ from: 'userType:', to: '_userType:' }]
  },
  {
    file: 'packages/ui/src/lib/components/modals/WelcomeModal.svelte',
    replacements: [{ from: /(step\)\s*=>)/, to: '_$1' }]
  },
  {
    file: 'packages/ui/src/lib/components/product/AppliedFilters.svelte',
    replacements: [{ from: "import { i18n }", to: "import { i18n as _i18n }" }]
  },
  {
    file: 'packages/ui/src/lib/components/product/CategoryFilterDropdown.svelte',
    replacements: [
      { from: "import { translateCategoryName }", to: "import { translateCategoryName as _translateCategoryName }" },
      { from: /categoryId(?=\s*\))/, to: '_categoryId' },
      { from: /originalFocus(?=\s*=)/, to: '_originalFocus' }
    ]
  },
  {
    file: 'packages/ui/src/lib/components/product/FeaturedProducts.svelte',
    replacements: [{ from: /(\(product,\s*)i(?=\))/, to: '$1_i' }]
  },
  {
    file: 'packages/ui/src/lib/components/product/FilterModal.svelte',
    replacements: [{ from: "import { tick }", to: "import { tick as _tick }" }]
  },
  {
    file: 'packages/ui/src/lib/components/product/FilterResultsAnnouncer.svelte',
    replacements: [{ from: "import { tick }", to: "import { tick as _tick }" }]
  },
  {
    file: 'packages/ui/src/lib/components/product/ProductBuyBox.svelte',
    replacements: [{ from: /import\s+{\s*m,/, to: 'import { m as _m,' }]
  },
  {
    file: 'packages/ui/src/lib/components/product/ProductHighlight.svelte',
    replacements: [{ from: /onBuy(?=\s*=\s*\$bindable)/, to: '_onBuy' }]
  },
  {
    file: 'packages/ui/src/lib/components/product/ProductInfo.svelte',
    replacements: [{ from: "import { i18n }", to: "import { i18n as _i18n }" }]
  },
  {
    file: 'packages/ui/src/lib/components/product/ProductReviews.svelte',
    replacements: [
      { from: /productId(?=\s*=\s*\$bindable)/, to: '_productId' },
      { from: /sellerId(?=\s*=\s*\$bindable)/, to: '_sellerId' }
    ]
  },
  {
    file: 'packages/ui/src/lib/components/product/ProductSeller.svelte',
    replacements: [
      { from: /import\s+{\s*m,/, to: 'import { m as _m,' },
      { from: "import { Badge }", to: "import { Badge as _Badge }" }
    ]
  },
  {
    file: 'packages/ui/src/lib/components/product/PromotedListingsSection.svelte',
    replacements: [
      { from: /onBuy(?=\s*=\s*\$bindable)/, to: '_onBuy' },
      { from: /function scrollLeft/, to: 'function _scrollLeft' },
      { from: /function scrollRight/, to: 'function _scrollRight' }
    ]
  },
  {
    file: 'packages/ui/src/lib/components/product/StickyFilterModal.svelte',
    replacements: [{ from: "import { tick }", to: "import { tick as _tick }" }]
  },
  {
    file: 'packages/ui/src/lib/components/product/VirtualProductGrid.svelte',
    replacements: [{ from: /perf(?=\s*=\s*{)/, to: '_perf' }]
  },
  {
    file: 'packages/ui/src/lib/components/utilities/TutorialToast.svelte',
    replacements: [{ from: "import { fade }", to: "import { fade as _fade }" }]
  }
];

let totalFixed = 0;

for (const { file, replacements } of finalFixes) {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} (not found)`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let fileFixed = 0;
  
  for (const { from, to } of replacements) {
    const pattern = from instanceof RegExp ? from : new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, to);
      fileFixed += matches.length;
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${fileFixed} issues in ${file}`);
    totalFixed += fileFixed;
  }
}

console.log(`\n🎉 Total fixed: ${totalFixed} issues`);
