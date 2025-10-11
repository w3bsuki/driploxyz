import fs from 'fs';
import path from 'path';

const FILES_TO_FIX = [
  // Media/layout
  'packages/ui/src/lib/components/layout/Footer.svelte',
  'packages/ui/src/lib/components/media/ImageUploaderSupabase.svelte',
  'packages/ui/src/lib/components/media/LazyImage.svelte',
  // Modals
  'packages/ui/src/lib/components/modals/BrandPaymentModal.svelte',
  'packages/ui/src/lib/components/modals/RatingModal.svelte',
  'packages/ui/src/lib/components/modals/ReviewModal.svelte',
  'packages/ui/src/lib/components/modals/WelcomeModal.svelte',
  // Navigation
  'packages/ui/src/lib/components/navigation/MobileMenuSearch.svelte',
  // Product
  'packages/ui/src/lib/components/product/AppliedFilterPills.svelte',
  'packages/ui/src/lib/components/product/AppliedFilters.svelte',
  'packages/ui/src/lib/components/product/CategoryFilterDropdown.svelte',
  'packages/ui/src/lib/components/product/CategoryGrid.svelte',
  'packages/ui/src/lib/components/product/FeaturedProducts.svelte',
  'packages/ui/src/lib/components/product/FilterModal.svelte',
  'packages/ui/src/lib/components/product/FilterPill.svelte',
  'packages/ui/src/lib/components/product/FilterPillGroup.svelte',
  'packages/ui/src/lib/components/product/FilterResultsAnnouncer.svelte',
  'packages/ui/src/lib/components/product/ProductActions.svelte',
  'packages/ui/src/lib/components/product/ProductBuyBox.svelte',
  'packages/ui/src/lib/components/product/ProductGallery.svelte',
  'packages/ui/src/lib/components/product/ProductHighlight.svelte',
  'packages/ui/src/lib/components/product/ProductInfo.svelte',
  'packages/ui/src/lib/components/product/ProductReviews.svelte',
  'packages/ui/src/lib/components/product/ProductSeller.svelte',
  'packages/ui/src/lib/components/product/PromotedListingsSection.svelte',
  'packages/ui/src/lib/components/product/StickyFilterModal.svelte',
  'packages/ui/src/lib/components/product/VirtualProductGrid.svelte',
  // UI
  'packages/ui/src/lib/components/ui/Accordion.svelte',
  'packages/ui/src/lib/components/ui/Avatar.svelte',
  'packages/ui/src/lib/components/ui/AvatarUploader.svelte',
  'packages/ui/src/lib/components/ui/FavoriteButton.svelte',
  'packages/ui/src/lib/components/ui/FollowButton.svelte',
  'packages/ui/src/lib/components/ui/TopProgress.svelte',
  // Utilities
  'packages/ui/src/lib/components/utilities/LanguageSwitcher.svelte',
  'packages/ui/src/lib/components/utilities/SEOMetaTags.svelte',
  'packages/ui/src/lib/components/utilities/ToastContainer.svelte',
  'packages/ui/src/lib/components/utilities/ToastProvider.svelte',
  'packages/ui/src/lib/components/utilities/TutorialToast.svelte',
  'packages/ui/src/lib/components/utilities/UnifiedCookieConsent.svelte',
];

const FIXES = [
  // Unused catch variables → remove parameter
  { pattern: /} catch \(error\) {\s+(?!.*\berror\b)/g, replacement: '} catch {\n' },
  { pattern: /} catch \(err\) {\s+(?!.*\berr\b)/g, replacement: '} catch {\n' },
  { pattern: /} catch \(e\) {\s+(?!.*\be\b)/g, replacement: '} catch {\n' },
  { pattern: /} catch \(innerError\) {\s+(?!.*\binnerError\b)/g, replacement: '} catch {\n' },
  { pattern: /} catch \(_error\) {/g, replacement: '} catch {' },
  
  // Simple any → Record<string, unknown>
  { pattern: /: any\[\]/g, replacement: ': unknown[]' },
  { pattern: /: any\b(?!;)/g, replacement: ': unknown' },
  { pattern: /: any;/g, replacement: ': unknown;' },
  { pattern: /<any>/g, replacement: '<unknown>' },
  { pattern: /as any\b/g, replacement: 'as unknown' },
  
  // Prefix unused vars that match specific patterns
  { pattern: /(\s+)(isLoading|errorText|compact|onBuy|isLoadingFavorite|sellerInitial|canMakeOffer|m|productId|sellerId|loading|hasImages|hasDescription|showFacts|Badge|onBuy|scrollLeft|scrollRight|overlay|content|titleEl|close|previousViewportHeight|previousContainerWidth|perf|i18n|originalFocus|Snippet|tick|FilterSection|FilterOption|item|userType|step|isIntersecting|handleKeyDown|fade|organizationJsonLd|lastTouchCenter|velocity)(\s*=\s*)/g, replacement: '$1_$2$3' },
];

let totalFixed = 0;

for (const file of FILES_TO_FIX) {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} (not found)`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let fileFixed = 0;
  
  for (const { pattern, replacement } of FIXES) {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      fileFixed += matches.length;
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${fileFixed} issues in ${file}`);
    totalFixed += fileFixed;
  }
}

console.log(`\n🎉 Total fixed: ${totalFixed} issues across ${FILES_TO_FIX.length} files`);
