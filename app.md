# Mobile App PRD and Tech Stack (C2C E‑commerce)

**Last Updated:** October 13, 2025  
**Target Launch:** Q1 2026

## Decision summary
- **Recommendation:** React Native 0.82 with Expo SDK 54 (managed workflow) inside pnpm monorepo.
- **Rationale:** New Architecture by default (RN 0.82), React 19.1, file-based routing (Expo Router), OTA updates (EAS Update), faster builds, Supabase-js support with AsyncStorage, first-class monorepo support (SDK 54+).
- **Version Stack:**
  - React Native: 0.82+ (New Architecture only, Hermes V1)
  - Expo SDK: 54.0.0+
  - React: 19.1.0+
  - Node: 20.19.x
  - Package Manager: pnpm (isolated deps now supported)
- **Alternatives Considered:** 
  - SvelteKit + Capacitor (faster initial ship but limited native UX/perf).
  - Flutter (excellent native UX but different language, less web code sharing).
  - Svelte Native (smaller ecosystem, higher risk).

## Can we use Supabase?
Yes. Use supabase-js in RN with AsyncStorage; Supabase Auth (magic links/OAuth), Postgres with RLS, Realtime, Storage, Edge Functions, and Webhooks.

---

## Product overview
- Goal: Mobile marketplace app enabling users to list, discover, chat, and transact peer‑to‑peer.
- Platforms: iOS, Android (later web reuse via RN Web for simple views if needed).
- KPI v1: activation (list an item), search->view->chat conversion, first transaction rate, 7‑day retention, message response time.

## Personas
- Seller: wants quick listing, price suggestions, safety, low friction.
- Buyer: wants trusted search, filters, fair pricing, quick messaging, local pickup/shipping.
- Moderator/Support: needs reporting, dispute handling.

## Core user stories (v1)
- Auth: Email magic link/OAuth (Apple, Google); logout; device trust.
- Profile: view/edit profile, avatar, ratings, addresses.
- Listings: create (title, price, category, photos, condition, location), edit, pause, delete, view my listings.
- Discovery: home feed, search, filters/sort, categories, favorites.
- Listing detail: photos, seller info, price, description, location, safety tips, report.
- Chat: 1:1 buyer‑seller chat, typing/online, unread counts, push notifications.
- Orders (MVP): intent to buy, confirm purchase, simple payment via Stripe Payment Links or PaymentSheet; status timeline.
- Notifications: push for chat, favorites price drop, order updates.
- Settings: notifications toggle, language, theme.

## Non‑functional requirements
- Performance: TTI < 2.5s cold start on mid‑range devices; image upload < 5s on 4G for single 1–2MB photo.
- Offline: read cached feeds and chats; queue listing draft; retry uploads.
- Security/Privacy: RLS everywhere; PII encryption at rest; audit logs; secure deep links.
- Accessibility: WCAG AA; dynamic type; VoiceOver/TalkBack.
- Observability: crash reporting, analytics, traces for critical flows.

## Information architecture & data model (Supabase)
Tables (simplified):
- profiles (id PK=auth.uid, username, avatar_url, rating, created_at)
- items (id, seller_id FK profiles.id, title, description, price, currency, condition, category_id, location, status, created_at)
- item_images (id, item_id FK items.id, url, sort)
- favorites (user_id, item_id, created_at)
- chats (id, item_id nullable, created_by)
- chat_members (chat_id, user_id, last_read_at)
- messages (id, chat_id, sender_id, body, type, created_at)
- orders (id, buyer_id, seller_id, item_id, status, amount, currency, created_at)
- payments (id, order_id, stripe_payment_intent_id, status, created_at)
- reviews (id, reviewer_id, reviewee_id, order_id, rating, comment)
- categories (id, name, parent_id)
- notifications (id, user_id, type, payload jsonb, read_at, created_at)
- device_tokens (user_id, expo_push_token, last_seen_at)
- reports (id, reporter_id, target_type, target_id, reason, created_at, handled_by, status)

Storage buckets: avatars/, item-images/ (public read via signed URLs), moderation quarantine/.

RLS policy highlights:
- profiles: user can select all; update own row only.
- items: select all where status in ('active','sold','paused' with seller); insert/update/delete only by seller_id = auth.uid().
- item_images: enforce ownership via join to items.
- chats/messages: members only (exists chat_members where user_id = auth.uid()).
- orders: visible to buyer or seller; payments: visible via order linkage.
- favorites/notifications/device_tokens: owner only.

Edge Functions (Deno):
- create-payment-intent (Stripe secret), handle-stripe-webhook, send-push (Expo push API), moderate-image (call Vision API/OSS NSFW), price-suggestions (optional), scheduled cleanups.

Realtime channels:
- messages: stream by chat_id; notifications by user_id; presence for chat typing.

## Client architecture (Expo RN 0.82 + SDK 54)
- **Language:** TypeScript 5.x (strict mode)
- **Navigation:** Expo Router 5.x (file-based, universal deep links)
- **Networking/Cache:** TanStack Query v5 + supabase-js 2.x
- **State:** Zustand 5.x (lightweight global state)
- **Forms:** React Hook Form 7.x + Zod 3.x
- **UI/Styling:** 
  - NativeWind 4.x (Tailwind CSS for RN)
  - Universal design tokens (shared with web)
  - react-native-reanimated 3.x (Layout Animations)
  - react-native-gesture-handler 2.x
- **Media:** 
  - expo-image-picker (optimized for New Arch)
  - expo-camera (React 19 compatible)
  - expo-image-manipulator (resize/compress)
  - expo-file-system
- **Auth:** 
  - supabase-js with @react-native-async-storage/async-storage
  - expo-auth-session for OAuth (Apple/Google)
  - Universal links for magic links
- **Payments:** 
  - @stripe/stripe-react-native (React 19 compatible)
  - Stripe PaymentSheet (native UI)
  - Edge Functions for payment intents
- **Push:** 
  - expo-notifications 0.32+
  - Expo Push Service (APNs/FCM abstraction)
- **Localization:** 
  - Shared i18n from @repo/i18n
  - Device locale detection
  - RTL support via I18nManager
- **Observability:** 
  - @sentry/react-native (New Arch compatible)
  - PostHog/Amplitude for product analytics
  - React Native DevTools (built-in since 0.76)

## Monorepo layout (pnpm workspaces + Turborepo)
```
driplo-turbo-1/
├── apps/
│   ├── web/           # Existing SvelteKit app
│   └── mobile/        # New Expo app (SDK 54)
├── packages/
│   ├── ui/            # Shared primitives (React + Svelte variants)
│   ├── config/        # Shared configs (eslint, tsconfig)
│   ├── database/      # Supabase types (existing)
│   ├── domain/        # Business logic (existing)
│   ├── i18n/          # Shared translations (existing)
│   └── mobile-shared/ # Mobile-specific shared code
│       ├── components/ # Reusable RN components
│       ├── hooks/     # Custom React hooks
│       ├── navigation/# Shared navigation types
│       └── utils/     # Mobile utilities
├── pnpm-workspace.yaml
├── turbo.json
├── .npmrc             # node-linker=hoisted (for SDK 54 compat)
└── package.json       # Root workspace config
```

**Notes:**
- Expo SDK 54+ supports isolated dependencies but some RN libs still need hoisted mode
- Use `workspace:*` protocol for internal packages
- Turborepo for parallel builds and caching

## Routing & key screens
- (auth)/sign-in, (auth)/callback
- (tabs)/home, search, sell, inbox, profile
- item/[id]
- chat/[id]
- order/[id]
- sell/new (multi-step)

## Flows
Auth: open app -> sign‑in -> magic link -> deep link to app -> session saved -> proceed.
Sell: pick images -> compress -> upload to temp -> create item -> attach images -> publish -> notify favorites.
Chat: open chat -> subscribe realtime -> send/receive -> push when backgrounded.
Buy: tap Buy -> create order -> Stripe payment (Edge Function) -> update status -> notify both parties.

## Deep linking
- Domain: app.example.com (AASA/assetlinks)
- Schemes: c2capp://
- supabase redirect URLs point to universal links; expo-router Linking configured accordingly.

## Security
- Device: secure storage for refresh tokens (expo-secure-store), pin/biometric optional.
- Transport: TLS; pin known hosts (optional); signed URLs for images with short TTL.
- Backend: strict RLS, minimal service roles on client; secrets only in Edge Functions.

## Offline strategy
- Query cache persist to AsyncStorage; optimistic UI for favorites/messages (with reconciler); draft listings saved locally until published.

## Observability & QA
- Crash: Sentry (source maps via EAS)
- Analytics events: app_open, sign_in, list_item, view_item, start_chat, send_message, start_checkout, payment_success, push_received.
- Testing: unit (Jest), component (RNTL), E2E (Maestro or Detox). Smoke tests in CI on PR.

## CI/CD
- EAS Build/Submit; EAS Update for OTA (non‑native changes)
- GitHub Actions: lint, typecheck, test; build previews with Expo
- Release channels: preview, staging, production; feature flags via Supabase table

## Internationalization
- i18n JSON per locale in packages/i18n; detect device locale; RTL support; currency formatting via Intl.

## Accessibility
- Test with screen readers, large fonts, contrast; focus order; hit slop; haptics.

## Risk & mitigation
- Payment complexity -> start with Payment Links; migrate to PaymentSheet later.
- Image moderation -> start manual review + report; add automated NSFW check later.
- SSO on iOS Apple Sign‑In requirement -> include Apple when distributing on iOS.
- Push reliability -> use Expo’s push, add retries and device token cleanup.

## Milestones
- M0: Repo prep (monorepo config, shared packages) [~1–2d]
- M1: Auth + shell nav + profile [~1w]
- M2: Listings create/view + storage [~1.5w]
- M3: Search/feed + favorites [~1w]
- M4: Chat realtime + push [~1w]
- M5: Checkout MVP (Payment Links) + orders [~1w]
- M6: Polish, a11y, i18n, analytics, beta [~1w]

## Open questions
- Shipping vs pickup MVP scope?
- Payment escrow or direct? (impacts dispute flows)
- Categories taxonomy ownership?
- Moderation policy and SLAs?

## Setup checklist (High-level)

### Phase 0: Monorepo Foundation
1. Configure `.npmrc` with `node-linker=hoisted`
2. Update `pnpm-workspace.yaml` to include `apps/mobile`
3. Update `turbo.json` with mobile build/dev tasks
4. Add React 19.1 resolution to root `package.json`

### Phase 1: Expo App Scaffold
1. Create Expo app: `pnpm create expo-app@latest apps/mobile --template`
2. Install Expo Router: `pnpm --filter mobile add expo-router`
3. Configure `app.json` for SDK 54, EAS, universal links
4. Set up NativeWind with Tailwind config
5. Verify Metro bundler works with monorepo (auto-detected in SDK 54+)

### Phase 2: Shared Packages Integration
1. Create `packages/mobile-shared` with React/RN utilities
2. Link existing packages: `@repo/database`, `@repo/i18n`, `@repo/domain`
3. Add Supabase client with AsyncStorage adapter
4. Configure TypeScript paths for workspace packages

### Phase 3: Authentication & Deep Linking
1. Configure OAuth providers (Apple/Google) in Supabase
2. Set up universal links (AASA file for iOS, assetlinks for Android)
3. Implement auth flow with expo-auth-session
4. Test magic link redirects from email → app

### Phase 4: EAS & CI/CD
1. Configure EAS Build (`eas.json` with development/preview/production)
2. Set up environment secrets (Supabase keys, Sentry DSN)
3. Configure EAS Update for OTA patches
4. Add GitHub Actions for lint/test/preview builds

### Phase 5: Core Features (Iterative)
See detailed implementation plan in `app_implementation.md`

Appendix: minimal client boot code (supabase)

```ts
// packages/supabase/client.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  }
)
```

```ts
// apps/mobile/app/_layout.tsx (expo-router)
import { Stack } from 'expo-router'
export default function Layout() { return <Stack screenOptions={{ headerShown: false }} /> }
```
