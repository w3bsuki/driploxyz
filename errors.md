# Targeted Type System Refactor Plan
**Mission**: Cut the 334 TypeScript errors by fixing the actual failure modes while aligning data models with Supabase and preserving UI-layer requirements.
**Current**: 334 errors (from `pnpm --filter @repo/ui check` on 2025-09-17).
**Target**: Fewer than 150 errors through focused refactors and DOM fixes.

## Reality Check: Tooling and Current State
- `svelte-check` surfaces DOM typing and null-safety issues first (see `packages/ui/src/lib/PromotedHighlights.svelte`).
- `packages/ui/src/lib/types/product.ts` already extends `Tables<'products'>`; consumers rely on the extra UI fields and legacy aliases there.
- `packages/ui/src/lib/types/index.ts` combines persisted data shapes (Profile, Order, Message, Review, Favorite) with pure UI tokens (ButtonVariant, DesignTokens). A blanket delete would drop legitimate UI definitions.

## Guiding Principles
- Single source for persisted data: re-export Supabase types (`Tables`, `TablesInsert`, `TablesUpdate`) instead of hand-written duplicates.
- Explicit UI extensions: model UI-only or computed fields as additive interfaces and document the transforms that populate them.
- Incremental change: update types and consumers in small batches, running `svelte-check` after each batch to keep the repo compiling.
- Fix what the diagnostics show: handle DOM typing and null checks alongside the type cleanup so the error count actually moves.

## Phase 0 - Pre-flight
1. Create a working branch: `git checkout -b targeted-type-cleanup`.
2. Capture the baseline diagnostics: `pnpm --filter @repo/ui check > .logs/ui-check-baseline.txt`.
3. Optionally get a sorted error list with `npx svelte-check --tsconfig ./tsconfig.json --output human`.

## Phase 1 - Audit Manual Types
1. In `packages/ui/src/lib/types/index.ts`, classify each export.
   - Persisted data candidates for Supabase aliases: `User`, `Profile`, `Order`, `Message`, `Review`, `Favorite`.
   - UI-only tokens that should stay manual: `ButtonVariant`, `DesignTokens`, `Breakpoint`, `ComponentState`, etc.
2. Cross-reference `packages/database/src/generated.ts` for the Supabase definitions (`Tables<'table'>`, `Enums<'enum'>`).
3. Sketch replacements (for example `export type Profile = Tables<'profiles'>;`) in comments to prepare consumer updates.

## Phase 2 - Refine Product Types
1. In `packages/ui/src/lib/types/product.ts`, introduce an explicit split between the database row and UI fields:
   ```ts
   import type { Tables } from '@repo/database';

   export type ProductRow = Tables<'products'>;

   export interface ProductUIFields {
     images: string[];
     slug?: string;
     sellerName: string;
     sellerRating: number;
     sellerAvatar?: string;
     sellerAccountType?: 'new_seller' | 'pro' | 'brand';
     category_name?: string;
     main_category_name?: string;
     subcategory_name?: string;
     specific_category_name?: string;
     seller_badges?: {
       is_pro: boolean;
       is_brand: boolean;
       is_verified: boolean;
     };
     seller_subscription_tier?: 'free' | 'basic' | 'pro' | 'brand';
     product_images?: Array<{ id: string; image_url: string; alt_text?: string; sort_order?: number }>;
     // Legacy aliases slated for removal once consumers migrate
     sellerId: string;
     createdAt: string;
     is_promoted?: boolean;
   }

   export type Product = ProductRow & ProductUIFields;
   ```
2. Keep `transformToUIProduct` but return `Product`, explicitly mapping legacy aliases (for example `sellerId: product.seller_id`).
3. Document which fields are Supabase-derived and which are computed so future contributors do not reintroduce manual overrides.

## Phase 3 - Replace Duplicated Persisted Types
Work in small batches and commit after each batch.
1. Swap the manual interfaces for `Profile`, `Order`, `Message`, `Review`, and `Favorite` to use `Tables<'...'>` aliases exported from `packages/ui/src/lib/types/index.ts`.
2. When UI-specific helpers are needed (for example computed display names), create `ProfileUIFields` style intersections similar to the `Product` pattern.
3. Update component imports to rely on the central exports rather than reaching into `@repo/database` directly.
4. After each batch, run `pnpm --filter @repo/ui check` and note the error delta.

## Phase 4 - Fix DOM and Null-Safety Errors
1. Tackle the concrete TypeScript errors in files like `packages/ui/src/lib/PromotedHighlights.svelte`.
   ```ts
   const items = container?.querySelectorAll<HTMLElement>('[data-highlight-item]');
   items?.[currentFocusIndex]?.focus();
   ```
2. Guard event targets before touching DOM APIs:
   ```ts
   onerror={(event) => {
     const target = event.currentTarget as HTMLImageElement | null;
     if (!target) return;
     target.style.display = 'none';
     target.nextElementSibling?.classList.remove('hidden');
   }}
   ```
3. Resolve accessibility warnings in `packages/ui/src/lib/AdminModal.svelte` by adding `tabindex="-1"` and keyboard handlers for clickable divs.
4. Continue iterating through the `svelte-check` output until DOM-related errors and warnings are cleared.

## Phase 5 - Verification and Cleanup
1. Run `pnpm --filter @repo/ui check` to confirm the new types and DOM fixes compile.
2. Execute `pnpm --filter @repo/ui test` (or targeted suites) for regression coverage.
3. Capture the final diagnostics snapshot: `pnpm --filter @repo/ui check > .logs/ui-check-final.txt`.
4. Prepare commits such as:
   - `feat(ui-types): align profile and order models with supabase`
   - `fix(ui): harden promoted highlights dom typing`
5. Update internal docs or ADRs if the type strategy changes.

## Reference Notes
- Supabase types live in `packages/database/src/generated.ts`; rely on `Tables<'table'>`, `TablesInsert<'table'>`, and `Enums<'enum'>` for reuse.
- Keep shared helpers inside `packages/ui/src/lib/types/` so apps avoid deep relative imports.
- Use loaders or factory helpers to build `Product` UI fields so Svelte 5 runes stay serialisable in the storefront.

## Risks and Mitigations
- Breaking UI consumers: mitigated by intersecting Supabase rows with `*UIFields` instead of deleting UI properties outright.
- Legacy alias drift: track remaining usage of `sellerId`, `createdAt`, and `is_promoted`; plan a follow-up cleanup once components migrate.
- Large refactor fatigue: commit per batch and run the standard quality gates (`pnpm -w turbo run lint`, `check-types`) before opening a PR.

## Success Criteria
- Error count drops from 334 to below 150, with the DOM typing issues resolved.
- UI-only capabilities remain intact; `Product` continues to expose computed fields required by components.
- Future Supabase schema changes propagate automatically via the regenerated `@repo/database` types.
