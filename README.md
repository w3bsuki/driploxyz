# 📱 Driplo - Mobile-First C2C Clothing Marketplace

> **Lightning-fast marketplace beating Depop & Vinted with superior mobile UX**

Built with Svelte 5 + SvelteKit 2 for unmatched mobile performance. The perfect balance of social engagement and transactional simplicity.

## ⚡ **Quick Start**

```bash
# Clone and install
git clone <repository-url>
cd driplo-turbo-1
pnpm install

# Setup environment
cp .env.example .env.local

# Start development
pnpm dev --filter web  # Opens at http://localhost:5173
```

**📱 Always test mobile-first at 375x667 viewport**

## 🚀 **Key Features**

- **Mobile-First UX**: 44px touch targets, bottom nav, native gestures
- **Lightning Performance**: <2s loading (competitors: 3-5s)
- **Simple Selling**: 3-step listing vs Depop's complexity
- **Social Commerce**: Perfect balance of social + transactional
- **PWA Ready**: Installable, offline support, push notifications

## 📚 **Documentation**

| Document | Description |
|----------|-------------|
| [PROJECT.md](./PROJECT.md) | Complete project specification, architecture, features |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Development workflow, standards, API docs |
| [ROADMAP.md](./ROADMAP.md) | Priorities, bugs, technical debt, feature pipeline |
| [OPERATIONS.md](./OPERATIONS.md) | Deployment, monitoring, scaling, incident response |
| [CLAUDE.md](./CLAUDE.md) | AI assistant context and rules |
| [CLAUDE_HOOKS.md](./docs/CLAUDE_HOOKS.md) | Claude‑code hooks & execution protocol |

## 🧭 Execution Workflow (Claude‑code)

Start here: `docs/RUNBOOK.md` for the single active task. Read `CLAUDE.md` first, then follow these tasks in order. Keep PRs small (≤400 LOC), update checkboxes in `docs/CODEX_TASKLIST.md`, and use the playbooks for precise steps and snippets.

- Task 0 — Melt UI Fix Pack (if blocking)
  - Source: `docs/MELT_UI_MIGRATION.md`
  - Goal: fix barrels (extensionless exports), load `semantic.css`, refactor Select actions, replace invalid utilities, adopt Tabs/Tooltip/Toast on one page.

- Task 1 — TypeScript Audit
  - Source: `docs/playbooks/typescript.md`
  - DoD: extensionless barrels, `satisfies` on loads/actions, no implicit `any`.

- Task 2 — Svelte 5 Audit
  - Source: `docs/playbooks/svelte5.md`
  - DoD: runes used for state ($state/$derived), property events (`onclick`), `$bindable` where two‑way binding is needed.

- Task 3 — SvelteKit 2 Audit
  - Source: `docs/playbooks/sveltekit2.md`
  - DoD: server‑first loads/actions, typed PageData, unified reroute export, canonical/hreflang utilities.

- Task 4 — Paraglide (i18n)
  - Source: `docs/playbooks/paraglide.md`
  - DoD: default `bg`, `/uk` → `en`, single reroute on server/client, link helper, canonical/hreflang on product/search/home, no hardcoded strings.

- Task 5 — Tailwind v4 Tokens
  - Source: `docs/playbooks/tailwindcss-v4.md`
  - DoD: `semantic.css` loaded once, tokens only (no raw colors), fix `outline-hidden` → `outline-none`.

- Task 6 — Melt UI Adoption
  - Source: `docs/playbooks/melt-ui.md` and `docs/MELT_UI_MIGRATION.md`
  - DoD: wrappers exported via `@repo/ui`, header menu aligned on mobile, Tabs/Tooltip/Toast used in real views, delete app‑level duplicates.

- Task 7 — Supabase Auth & Data
  - Source: `docs/playbooks/supabase.md`
  - DoD: SSR `safeGetSession`, POST‑only logout with origin checks, onboarding updates profile only, reviews table + RLS.

- Task 8 — Playwright Smokes + a11y
  - Source: `docs/playbooks/playwright.md`
  - DoD: smokes for auth/sell/search/buy/orders/reviews, axe checks on home/product/search/checkout.

## 🧹 Debloat & Refactor Plan

Do a light pre‑cleanup to reduce noise, then a final sweep after audits.

- Pre‑cleanup (now):
  - Remove duplicate/backups (e.g., `service-worker.js`, `*.bak`), fix barrels, load `semantic.css`.
  - Replace app‑level duplicates with `@repo/ui` and delete wrappers once green.

- During audits (per task):
  - Refactor in place following each playbook; remove dead code as you go.

- Final sweep (pre‑release):
  - Repo‑wide search for TODO/console.*, unused exports; run formatting/lint; confirm 0 TS errors; QA gates per `docs/V1_driplo.md`.

## 🛠 **Tech Stack**

- **Frontend**: Svelte 5, SvelteKit 2, TailwindCSS v4 (OKLCH)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe Connect
- **Infrastructure**: Vercel Edge, Turborepo

## 🎯 **Project Status**

- **Phase**: Pre-Production Cleanup
- **Completion**: 85% feature complete
- **Blockers**: 71 TypeScript errors
- **Performance**: 820ms LCP (excellent)

## 🤝 **Contributing**

1. Read [DEVELOPMENT.md](./DEVELOPMENT.md) for setup
2. Check [ROADMAP.md](./ROADMAP.md) for priorities
3. Follow mobile-first principles in [CLAUDE.md](./CLAUDE.md)
4. Test at 375px viewport always

---

**Mission**: Dominate the €5B+ secondhand fashion market with superior mobile UX 🚀
