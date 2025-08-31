# Production Readiness Checklist — Driplo V1

Use this checklist to gate the final release. Tick items as they pass. Keep notes short and factual.

## Features — Happy Paths
- [ ] Auth: signup → verify → login → logout (SSR persistence)
- [ ] Onboarding: username/avatar/payout flags saved; redirect to dashboard
- [ ] Sell: create listing with images; validate; redirect to product
- [ ] Discover/Search: query + filter + paginate; wishlist works
- [ ] Buy: checkout with test keys; order recorded; buyer/seller see order
- [ ] Orders: mark shipped → received; timeline updates
- [ ] Reviews: leave review after delivery; profile rating updates
- [ ] Messaging: send/receive; rate limited; no duplicates

## Security & Data
- [ ] RLS policies verified (products, orders, messages, images, reviews)
- [ ] CSRF on non‑action POSTs; logout POST‑only w/ origin checks
- [ ] Rate limits on sensitive routes (auth, favorites, orders, payments)
- [ ] No service keys in client bundles; envs validated at boot

## Performance (Mobile Budgets)
- [ ] Lighthouse mobile p75 ≥ 90
- [ ] LCP ≤ 1.5s p75 on home/search/product
- [ ] CLS ≤ 0.1; TBT ≤ 300ms; bundle size acceptable

## Accessibility
- [ ] Axe checks (home/product/search/checkout) show no critical issues
- [ ] Keyboard navigation: focus rings visible; Escape closes dialogs/menus
- [ ] Touch targets: 44px/36–40px as appropriate

## Observability
- [ ] Sentry DSNs set; prod‑only init; error handler wired
- [ ] Structured logs for auth, orders, payments

## CI/CD Gates
- [ ] CI runs types, lint, unit, component, E2E smokes on PR
- [ ] (Optional) LHCI job on preview or local CI step
- [ ] Deploy gated on green checks

## Docs & Cleanup
- [ ] Docs consolidated under `docs/`; archives moved per CLEANUP_PLAN
- [ ] CODEX_TASKLIST updated; CONTEXT entries added
- [ ] No `*.bak` or dead service workers; no experimental UI in `@repo/ui`

## Cutover
- [ ] Staging deploy OK; smokes pass; webhook tests pass
- [ ] Production deploy scheduled; monitoring dashboard ready
- [ ] Rollback plan verified (redeploy last green; low‑risk DB changes)

Owner: Platform (you + Claude‑code)
