# Cleanup Plan

This document outlines the plan to audit the codebase and delete unused files and code.

## 1. Immediate Cleanup (Safe to Delete)

- [x] `web-full-tree.txt` (Deleted)
- [ ] `apps/web/typescript-errors.txt`
- [ ] `apps/web/typescript-errors-detailed.txt`
- [ ] `apps/web/errors.txt`
- [ ] `apps/web/.svelte-kit` (Generated folder, can be deleted and regenerated)
- [ ] `apps/web/test-results`
- [ ] `apps/web/playwright-report`
- [ ] `apps/web/.lighthouseci`

## 2. Unused Components (Identified by `analyze-components.js`)

The following components were identified as unused in `apps/web`:

- `src/lib/components/banners/EarlyBirdBanner.svelte`
- `src/lib/components/BrandPaymentModal.svelte`
- `src/lib/components/ErrorBoundary.svelte`
- `src/lib/components/FavoriteButtonWithRealtimeWrapper.svelte`
- `src/lib/components/FollowButtonWithRealtimeWrapper.svelte`
- `src/lib/components/FormErrorBoundary.svelte`
- `src/lib/components/forms/EnhancedForm.svelte`
- `src/lib/components/forms/MultiStepForm.svelte`
- `src/lib/components/forms/SelectField.svelte`
- `src/lib/components/forms/TextareaField.svelte`
- `src/lib/components/HeroSearch.svelte`
- `src/lib/components/LocaleSuggestionBanner.svelte`
- `src/lib/components/messaging/ConversationList.svelte`
- `src/lib/components/messaging/MessageInput.svelte`
- `src/lib/components/messaging/MessageThread.svelte`
- `src/lib/components/OnboardingSuccessModal.svelte`
- `src/lib/components/OptimizedImage.svelte`
- `src/lib/components/PageLoader.svelte`
- `src/lib/components/PaymentErrorBoundary.svelte`
- `src/lib/components/PayoutRequestModal.svelte`
- `src/lib/components/realtime/LocaleDetector.svelte`
- `src/lib/components/realtime/RealtimeManager.svelte`
- `src/lib/components/RegionSwitchModal.svelte`
- `src/lib/components/VirtualProductGrid.svelte`

## 3. Broken/Unused Scripts

- [ ] Remove `keeplist:*` scripts from `package.json` as `scripts/migration/keep-list-migration` does not exist.
- [ ] Review `scripts/` folder for other unused scripts.

## 4. Further Analysis (To Be Performed)

- [ ] Run `knip` to identify unused exports and files in `apps/web` and `apps/mobile`.
- [ ] Run `depcheck` to identify unused dependencies.
- [ ] Audit `packages/` for unused packages.

## 5. Execution Plan

1.  Delete the "Immediate Cleanup" files.
2.  Delete the "Unused Components".
3.  Remove broken scripts from `package.json`.
4.  Run `knip` and `depcheck` and append findings to this plan.
5.  Ask for user confirmation before deleting the findings from step 4.

## 6. Unused Files (Identified by `knip` in `apps/web`)

The following files were identified as unused by `knip`.

### Config/Root Files (Review carefully)
- `apps/web/lighthouserc.cjs`
- `apps/web/postcss.config.cjs`
- `apps/web/vite.dev.config.js`
- `apps/web/vite.dev.config.ts`
- `apps/web/src/hooks.ts`
- `apps/web/src/service-worker.ts`
- `apps/web/src/test-setup.ts`
- `apps/web/static/fonts/inter.css`

### Source Files
- `apps/web/src/lib/index.ts`
- `apps/web/src/lib/links.ts`
- `apps/web/src/lib/auth/AuthErrorBoundary.svelte`
- `apps/web/src/lib/auth/hooks.ts`
- `apps/web/src/lib/categories/translation-test.ts`
- `apps/web/src/lib/client/auth.ts`
- `apps/web/src/lib/data/collections.ts`
- `apps/web/src/lib/env/server.ts`
- `apps/web/src/lib/env/validation.ts`
- `apps/web/src/lib/hooks/use-country.ts`
- `apps/web/src/lib/locale/detection.ts`
- `apps/web/src/lib/server/api.ts`
- `apps/web/src/lib/server/auth-guard.ts`
- `apps/web/src/lib/server/auth.ts`
- `apps/web/src/lib/server/categories.remote.ts`
- `apps/web/src/lib/server/country-redirect.ts`
- `apps/web/src/lib/server/country.ts`
- `apps/web/src/lib/server/env.ts`
- `apps/web/src/lib/server/error-handler.ts`
- `apps/web/src/lib/server/geo-detection.ts`
- `apps/web/src/lib/server/hooks.ts`
- `apps/web/src/lib/server/i18n.ts`
- `apps/web/src/lib/server/locale-redirect.ts`
- `apps/web/src/lib/server/rate-limit.ts`
- `apps/web/src/lib/server/rate-limiter.ts`
- `apps/web/src/lib/server/reviews.ts`
- `apps/web/src/lib/server/sentry-config.ts`
- `apps/web/src/lib/server/sentry.ts`
- `apps/web/src/lib/server/supabase-hooks.ts`
- `apps/web/src/lib/server/validation.ts`
- `apps/web/src/lib/server/virtual-categories.ts`
- `apps/web/src/lib/stores/auth.svelte.ts`
- `apps/web/src/lib/stores/categories-cache.svelte.ts`
- `apps/web/src/lib/stores/follow.svelte.ts`
- `apps/web/src/lib/stores/purchase.svelte.ts`
- `apps/web/src/lib/stores/toast.svelte.ts`
- `apps/web/src/lib/supabase/columns.ts`
- `apps/web/src/lib/supabase/country-queries.ts`
- `apps/web/src/lib/types/index.ts`
- `apps/web/src/lib/types/product.ts`
- `apps/web/src/lib/utils/auth-helpers.ts`
- `apps/web/src/lib/utils/date.ts`
- `apps/web/src/lib/utils/domains.ts`
- `apps/web/src/lib/utils/format.ts`
- `apps/web/src/lib/utils/guards.ts`
- `apps/web/src/lib/utils/image-optimization.ts`
- `apps/web/src/lib/utils/image-processing.ts`
- `apps/web/src/lib/utils/locale-links.ts`
- `apps/web/src/lib/utils/messages-error-handler.ts`
- `apps/web/src/lib/utils/monitoring.ts`
- `apps/web/src/lib/utils/payments.ts`
- `apps/web/src/lib/utils/performance.ts`
- `apps/web/src/lib/utils/pluralization.ts`
- `apps/web/src/lib/utils/rate-limiting.ts`
- `apps/web/src/lib/utils/realtimeSetup.ts`
- `apps/web/src/lib/utils/rtl.ts`
- `apps/web/src/lib/utils/security-audit.ts`
- `apps/web/src/lib/utils/sentry-auth.ts`
- `apps/web/src/lib/utils/slug-backfill.ts`
- `apps/web/src/lib/utils/url.ts`
- `apps/web/src/lib/utils/viewTracking.ts`
- `apps/web/src/routes/(api)/favorites.remote.ts`
- `apps/web/src/lib/primitives/toast/store.ts`
- `apps/web/src/lib/server/analytics/product.ts`
- `apps/web/src/lib/server/middleware/validation.ts`
- `apps/web/src/lib/server/products/index.ts`
- `apps/web/src/lib/server/utils/cache.ts`
- `apps/web/src/lib/server/utils/payments.ts`
- `apps/web/src/lib/server/utils/rate-limiting.ts`
- `apps/web/src/lib/server/supabase/client.ts`
- `apps/web/src/lib/server/supabase/columns.ts`
- `apps/web/src/lib/server/supabase/country-queries.ts`
- `apps/web/src/lib/server/supabase/image-processor.ts`
- `apps/web/src/lib/server/supabase/storage.ts`
- `apps/web/src/routes/(protected)/sell/components/StepCollection.svelte`
- `apps/web/src/routes/(protected)/sell/components/StepPhotosAndBasicInfo.svelte`
- `apps/web/src/routes/(protected)/sell/components/StepPhotosDetails.svelte`
- `apps/web/src/routes/(protected)/sell/components/StepProductInfo.svelte`
- `apps/web/src/routes/(protected)/sell/components/StepReview.svelte`

### Unused Dependencies (apps/web)
- `web-vitals`
- `sharp`

### Unused DevDependencies (apps/web)
- `@sentry/vite-plugin`
- `tslib`

## 7. Unused Files (Identified by `knip` in `apps/mobile`)

The following files were identified as unused by `knip` in `apps/mobile`.

### Config Files (Review carefully)
- `apps/mobile/babel.config.js`
- `apps/mobile/tailwind.config.js`

### Source Files
- `apps/mobile/components/hello-wave.tsx`
- `apps/mobile/contexts/AuthContext.tsx`
- `apps/mobile/contexts/QueryProvider.tsx`
- `apps/mobile/hooks/use-color-scheme.web.ts`
- `apps/mobile/lib/supabase.ts`
- `apps/mobile/components/ui/icon-symbol.ios.tsx`

### Unused Dependencies (apps/mobile)
- `expo-image-picker`
- `expo-camera`

## 8. Next Steps

1.  **Review**: Please review the lists in sections 6 and 7.
2.  **Execute**: If you agree, I can proceed to delete the "Source Files" listed in sections 6 and 7.
3.  **Dependencies**: I can also remove the unused dependencies from `package.json` files.
