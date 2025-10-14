# Supabase Production Audit (SSR + Backend)

Date: 2025-10-14
Project Ref: koowfhsaqmarfdkwsfiz
API URL: https://koowfhsaqmarfdkwsfiz.supabase.co

## Summary
- Connected to Supabase MCP successfully with the updated project_ref.
- Retrieved security and performance advisors, schema overview, storage config, and buckets.
- Updated web server helpers to remove insecure hardcoded Supabase URL/Anon key fallbacks and rely on PUBLIC_ env only.

## Key Findings

### Security Advisors
- WARN: Auth OTP expiry > 1h. Set to <= 1h.
- WARN: Leaked password protection disabled. Enable HaveIBeenPwned checks.
- WARN: Postgres version has security patches available. Plan upgrade.

### Performance Advisors
- Multiple unindexed foreign keys detected across tables (examples: admin_actions.admin_id, balance_history.created_by, conversations.* refs, messages.* refs, orders.buyer_id, products.* drip_* refs, etc.). Create covering indexes.
- Unused indexes on search_analytics: idx_search_analytics_clicked_product_id, idx_search_analytics_user_id. Consider dropping if confirmed unused.

### Schema Snapshot (selected)
- Core tables with RLS enabled: products, profiles, product_images, orders, messages, reviews, favorites, brand_collections, conversations, etc.
- Supporting tables: seller_balances, payout_requests, balance_history, notifications, followers, user_subscriptions, subscription_plans, brand_suggestions, product_views, search_analytics, presence, etc.
- Many functions/migrations present; latest migrations include foreign key index batches and security fixes through 2025-10-14.

### Extensions
- Installed: pg_graphql 1.5.11, pgcrypto, uuid-ossp, pg_trgm, pg_stat_statements, vector, pgaudit, supabase_vault, etc.
- Available but not installed by default: pgsodium, postgis, rum, etc.

### Storage
- Buckets:
  - product-images (public, 50MB limit; jpeg/png/webp/jpg/heic/heif/octet-stream)
  - profile-avatars (public, 10MB)
  - message-attachments (private, 25MB; allows gif)
  - avatars (public, 10MB)
- Storage config: fileSizeLimit=50MB; imageTransformation enabled; S3 protocol enabled.

## App Integration (SSR)
- hooks.server.ts correctly creates per-request SSR client using @supabase/ssr with cookie getAll/setAll and secure defaults; safeGetSession uses getUser() to validate JWT.
- +layout.server.ts returns cookies via data.cookies for SSR; +layout.ts constructs server/browser client with cookies from data. Correct per docs.
- Removed insecure hardcoded fallbacks in:
  - apps/web/src/lib/server/supabase/server.ts
  - apps/web/src/lib/supabase/server.ts
  These now require PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY.

## Action Items

Priority P0 (Security)
- Enable leaked password protection in Auth settings.
- Reduce OTP expiry to <= 60 minutes.
- Remove any remaining hardcoded Supabase keys/URLs in repo; enforce env-driven config only.
- Plan Postgres upgrade to apply security patches.

Priority P1 (Performance)
- Add covering indexes for detected unindexed foreign keys (see advisor list). Validate with EXPLAIN on hot queries.
- Review and drop unused indexes (search_analytics) after confirming via pg_stat_statements.
- Ensure pg_stat_statements is enabled and retained after upgrades (appears installed).

Priority P2 (DX/Consistency)
- Ensure a single canonical server util is used (prefer using event.locals.supabase in route handlers).
- Add database type generation step consistency (scripts to regenerate types after migrations).

## Suggested SQL (examples)
- Create index for missing FK (example):
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_balance_history_created_by ON public.balance_history (created_by);

- Drop unused index (example):
  DROP INDEX CONCURRENTLY IF EXISTS public.idx_search_analytics_clicked_product_id;

Note: Always validate on staging and during low-traffic windows. Use CONCURRENTLY where supported.

## Verification
- Advisors and lists pulled via Supabase MCP for project koowfhsaqmarfdkwsfiz.
- Storage buckets listed and validated.
- Code changes compile locally with static env imports.

## Next Steps
- I can generate a migration file to add the missing FK indexes and a cleanup migration to drop unused indexes. Confirm and I’ll prepare the SQL under supabase/migrations with safe CONCURRENTLY statements.
- Proceed to TypeScript production audit next.
