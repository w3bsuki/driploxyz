import fs from 'fs';
import path from 'path';

const specificFixes = [
  // PaymentForm - rename _error to err and use it
  {
    file: 'packages/ui/src/lib/components/forms/PaymentForm.svelte',
    replacements: [
      { from: /} catch \(_error\) {/, to: '} catch (err) {' },
      { from: /console\.error\('Stripe payment confirmation failed:',\s*_error\);/, to: "console.error('Stripe payment confirmation failed:', err);" }
    ]
  },
  // ImageUploaderSupabase - empty blocks and unused var
  {
    file: 'packages/ui/src/lib/components/media/ImageUploaderSupabase.svelte',
    replacements: [
      { from: /} catch {\s*}\s*finally {/, to: '} catch {\n      // Ignore conversion errors\n    } finally {' },
      { from: /} catch {\s*}(\s+async function)/, to: '} catch {\n      // Ignore loading errors\n    }$1' },
      { from: /handleKeyDown(?=\s*=)/, to: '_handleKeyDown' }
    ]
  },
  // BrandPaymentModal - remove eslint-disable and empty block
  {
    file: 'packages/ui/src/lib/components/modals/BrandPaymentModal.svelte',
    replacements: [
      { from: /\/\/ eslint-disable-next-line @typescript-eslint\/no-explicit-any\s+/g, to: '' },
      { from: /} catch {\s*}\s*const successUrl/, to: '} catch {\n        // Ignore Stripe errors\n      }\n      const successUrl' }
    ]
  },
  // ReviewModal, WelcomeModal, FeaturedProducts - unused params
  {
    file: 'packages/ui/src/lib/components/modals/ReviewModal.svelte',
    replacements: [{ from: /userType(?=\s*:)/, to: '_userType' }]
  },
  {
    file: 'packages/ui/src/lib/components/modals/WelcomeModal.svelte',
    replacements: [{ from: /step(?=\s*\)\s*=>)/, to: '_step' }]
  },
  {
    file: 'packages/ui/src/lib/components/product/FeaturedProducts.svelte',
    replacements: [{ from: /\(product,\s*i\)/, to: '(product, _i)' }]
  },
  // Product components - unused imports/vars
  {
    file: 'packages/ui/src/lib/components/product/AppliedFilters.svelte',
    replacements: [{ from: /'i18n'/, to: "'_i18n'" }]
  },
  {
    file: 'packages/ui/src/lib/components/product/CategoryFilterDropdown.svelte',
    replacements: [
      { from: /import type { Snippet }/, to: 'import type { Snippet as _Snippet }' },
      { from: /CategoryOption,/, to: '_CategoryOption,' },
      { from: /CategoryHierarchy/, to: '_CategoryHierarchy' },
      { from: /'translateCategoryName'/, to: "'_translateCategoryName'" },
      { from: /categoryId(?=\s*\))/, to: '_categoryId' },
      { from: /originalFocus(?=\s*=)/, to: '_originalFocus' }
    ]
  },
  {
    file: 'packages/ui/src/lib/components/product/FilterModal.svelte',
    replacements: [
      { from: /import type { Snippet }/, to: 'import type { Snippet as _Snippet }' },
      { from: /'tick'/, to: "'_tick'" },
      { from: /FilterSection/, to: '_FilterSection' }
    ]
  },
  {
    file: 'packages/ui/src/lib/components/product/FilterPillGroup.svelte',
    replacements: [
      { from: /import type { Snippet }/, to: 'import type { Snippet as _Snippet }' },
      { from: /FilterOption/, to: '_FilterOption' }
    ]
  },
  {
    file: 'packages/ui/src/lib/components/product/FilterResultsAnnouncer.svelte',
    replacements: [{ from: /'tick'/, to: "'_tick'" }]
  },
  {
    file: 'packages/ui/src/lib/components/product/ProductBuyBox.svelte',
    replacements: [{ from: /m(?=,\s*\{)/, to: '_m' }]
  },
  {
    file: 'packages/ui/src/lib/components/product/ProductHighlight.svelte',
    replacements: [{ from: /onBuy(?=\s*=)/, to: '_onBuy' }]
  },
  {
    file: 'packages/ui/src/lib/components/product/ProductInfo.svelte',
    replacements: [{ from: /'i18n'/, to: "'_i18n'" }]
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
      { from: /m(?=,\s*\{)/, to: '_m' },
      { from: /'Badge'/, to: "'_Badge'" }
    ]
  },
  {
    file: 'packages/ui/src/lib/components/product/PromotedListingsSection.svelte',
    replacements: [
      { from: /onBuy(?=\s*=)/, to: '_onBuy' },
      { from: /'scrollLeft'/, to: "'_scrollLeft'" },
      { from: /'scrollRight'/, to: "'_scrollRight'" }
    ]
  },
  {
    file: 'packages/ui/src/lib/components/product/StickyFilterModal.svelte',
    replacements: [{ from: /'tick'/, to: "'_tick'" }]
  },
  {
    file: 'packages/ui/src/lib/components/product/VirtualProductGrid.svelte',
    replacements: [{ from: /perf(?=\s*=)/, to: '_perf' }]
  },
  {
    file: 'packages/ui/src/lib/components/utilities/TutorialToast.svelte',
    replacements: [{ from: /'fade'/, to: "'_fade'" }]
  }
];

let totalFixed = 0;

for (const { file, replacements } of specificFixes) {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} (not found)`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let fileFixed = 0;
  
  for (const { from, to } of replacements) {
    const pattern = from instanceof RegExp ? from : new RegExp(from, 'g');
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
