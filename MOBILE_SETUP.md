# Mobile Setup — Expo + Turborepo (pnpm)

Purpose: add a React Native app to this Turborepo fast, safely, and in a way that plays nicely with pnpm and shared packages. This guide is copy-paste ready and optimized for our current workspace: pnpm + Turborepo + apps/* layout.

Summary
- Recommended path: apps/mobile (matches existing pnpm workspace).
- Alternative path: /mobile root folder (requires minor workspace tweaks).
- Stack: Expo (React Native) + Expo Router + Supabase + EAS builds.

Prerequisites
- Node 18+
- pnpm installed (repo uses pnpm@10)
- Android Studio (Android emulator) and/or Xcode (iOS simulator on macOS)
- Expo account for EAS builds (optional until you ship)
- Supabase project URL + anon key available (already used by web)

Option A: apps/mobile (recommended)
1) Scaffold the app
   From repo root:
   ```sh
   pnpm dlx create-expo-app apps/mobile --template blank-typescript
   pnpm install
   ```

2) Add Expo Router and core RN deps
   ```sh
   pnpm --filter mobile add expo-router react-native-safe-area-context react-native-screens
   ```

3) Configure package.json entry
   In apps/mobile/package.json add:
   ```json
   {
     "name": "mobile",
     "private": true,
     "main": "expo-router/entry",
     "scripts": {
       "dev": "expo start",
       "start": "expo start",
       "android": "expo run:android",
       "ios": "expo run:ios",
       "lint": "expo lint || true",
       "check-types": "tsc --noEmit"
     }
   }
   ```
   Notes
   - Turborepo picks up these scripts automatically. Run via root with `pnpm turbo run dev --filter=mobile` or `pnpm --filter mobile start`.

4) Metro config for pnpm monorepo
   Create apps/mobile/metro.config.js:
   ```js
   // apps/mobile/metro.config.js
   const { getDefaultConfig } = require('@expo/metro-config');
   const path = require('path');

   const projectRoot = __dirname;
   const workspaceRoot = path.resolve(projectRoot, '../..');

   const config = getDefaultConfig(projectRoot);

   // Watch the whole workspace (packages/* changes are picked up)
   config.watchFolders = [workspaceRoot];

   // Resolve modules from app and hoisted node_modules (pnpm)
   config.resolver.nodeModulesPaths = [
     path.resolve(projectRoot, 'node_modules'),
     path.resolve(workspaceRoot, 'node_modules'),
   ];

   // Avoid duplicate/incorrect resolutions
   config.resolver.disableHierarchicalLookup = true;

   module.exports = config;
   ```

5) App config + env wiring
   Create apps/mobile/app.config.ts to expose env to the client:
   ```ts
   // apps/mobile/app.config.ts
   import 'dotenv/config';
   import type { ExpoConfig } from '@expo/config';

   export default (): ExpoConfig => ({
     name: 'Driplo',
     slug: 'driplo',
     scheme: 'driplo',
     version: '1.0.0',
     orientation: 'portrait',
     ios: { supportsTablet: false, bundleIdentifier: 'com.driplo.app' },
     android: { package: 'com.driplo.app' },
     extra: {
       PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
       PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY,
       PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY,
     },
   });
   ```
   Ensure repo root `.env.local` (or `.env`) defines:
   ```
   PUBLIC_SUPABASE_URL=...
   PUBLIC_SUPABASE_ANON_KEY=...
   PUBLIC_STRIPE_PUBLISHABLE_KEY=...
   ```

6) Create the initial screens (Expo Router)
   Files:
   - apps/mobile/app/_layout.tsx
   - apps/mobile/app/index.tsx

   _layout.tsx
   ```tsx
   import { Stack } from 'expo-router';
   import { SafeAreaProvider } from 'react-native-safe-area-context';

   export default function RootLayout() {
     return (
       <SafeAreaProvider>
         <Stack>
           <Stack.Screen name="index" options={{ title: 'Driplo' }} />
         </Stack>
       </SafeAreaProvider>
     );
   }
   ```

   index.tsx
   ```tsx
   import { Text, View } from 'react-native';

   export default function HomeScreen() {
     return (
       <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
         <Text>Welcome to Driplo Mobile</Text>
       </View>
     );
   }
   ```

7) Supabase client for React Native
   Install and create a RN-safe client with persistent auth storage.
   ```sh
   pnpm --filter mobile add @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill expo-constants
   ```

   Create apps/mobile/src/lib/supabase.ts
   ```ts
   import 'react-native-url-polyfill/auto';
   import AsyncStorage from '@react-native-async-storage/async-storage';
   import { createClient } from '@supabase/supabase-js';
   import Constants from 'expo-constants';

   const extra = Constants.expoConfig?.extra as any;

   export const supabase = createClient(
     extra?.PUBLIC_SUPABASE_URL,
     extra?.PUBLIC_SUPABASE_ANON_KEY,
     {
       auth: {
         storage: AsyncStorage,
         autoRefreshToken: true,
         persistSession: true,
         detectSessionInUrl: false,
       },
     }
   );
   ```

8) Deep linking for auth (magic links)
   - Scheme already set to `driplo` in app.config.ts
   - In your auth flows when sending magic links, pass `emailRedirectTo` like `driplo://auth/callback`.
   - Handle the callback and exchange the code for a session.

   Add apps/mobile/src/auth/deeplink.ts
   ```ts
   import * as Linking from 'expo-linking';
   import { supabase } from '../lib/supabase';

   export async function handleInitialUrl() {
     const url = await Linking.getInitialURL();
     if (url) await handleUrl(url);
   }

   export function subscribeToLinks() {
     const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
     return () => sub.remove();
   }

   async function handleUrl(url: string) {
     const { queryParams } = Linking.parse(url);
     const code = (queryParams?.code as string) || '';
     if (code) {
       await supabase.auth.exchangeCodeForSession(code);
     }
   }
   ```

   Call in your root (e.g., inside _layout or a provider):
   ```tsx
   import { useEffect } from 'react';
   import { handleInitialUrl, subscribeToLinks } from '../src/auth/deeplink';

   useEffect(() => {
     handleInitialUrl();
     const unsub = subscribeToLinks();
     return unsub;
   }, []);
   ```

9) Running the app
   - Dev server: `pnpm --filter mobile start`
   - Android emulator: `pnpm --filter mobile android`
   - iOS simulator (macOS): `pnpm --filter mobile ios`

10) EAS builds (cloud)
   ```sh
   pnpm add -w -D eas-cli
   pnpm exec eas login
   pnpm --filter mobile exec eas build -p android
   pnpm --filter mobile exec eas build -p ios
   ```
   Notes
   - The first time, EAS will guide you through credentials setup.
   - Use EAS Submit to push to Play/App Store when ready.

11) Sharing code in the monorepo
   - OK to import pure TS utilities/types from packages/* (e.g., packages/types, packages/database if it’s framework-agnostic).
   - Do NOT import Svelte UI from packages/ui. Create a new `packages/ui-native` for RN components if/when needed.
   - Metro will transpile TS from packages; ensure package entry points use `src/index.ts` and TypeScript outputs are not required at import time.

12) Add optional root helpers (nice-to-have)
   In package.json (root), add convenience scripts:
   ```json
   {
     "scripts": {
       "dev:mobile": "turbo run dev --filter=mobile",
       "build:mobile": "turbo run build --filter=mobile"
     }
   }
   ```

Option B: /mobile at repo root (alternative)
1) Scaffold in /mobile
   ```sh
   pnpm dlx create-expo-app mobile --template blank-typescript
   pnpm install
   ```

2) Include it in pnpm workspaces
   Edit pnpm-workspace.yaml and add `"mobile"` to `packages:`
   ```yaml
   packages:
     - "apps/*"
     - "packages/*"
     - "mobile"
   ```

3) Metro and app.config are identical to Option A
   - Place metro.config.js and app.config.ts under `mobile/` instead of `apps/mobile/`.
   - Scripts and dependencies are the same.

4) Turbo requires no changes
   - Turborepo discovers packages from pnpm workspaces; no turbo.json changes needed.
   - You can run `pnpm --filter mobile start` immediately after install.

Troubleshooting (common pnpm + Metro issues)
- Duplicate module resolution or invariant violations
  - Ensure `config.resolver.disableHierarchicalLookup = true` in metro.config.js
  - Ensure `config.resolver.nodeModulesPaths` points to both app and workspace root node_modules
  - Restart Expo (`r` in terminal), clear cache with `expo start -c`
- Cannot find module from shared package
  - Verify `packages/<pkg>/package.json` has a valid `main` (e.g., `src/index.ts`) and isn’t publishing `exports` incompatible with Metro
  - Avoid importing Node-only modules or Svelte files from RN
- SUPABASE URL/keys undefined in app
  - Confirm `.env.local` exists at repo root and `app.config.ts` reads from process.env to `extra`
  - `Constants.expoConfig?.extra` should contain the values at runtime

Phase 0 “Done” checklist
- App boots on simulator or device
- Supabase auth via magic link works (deep link handled)
- Simple read-only screen renders
- Web app builds unaffected (`pnpm --filter web build` stays green)

Appendix: minimal file tree (Option A)
```
apps/
  mobile/
    app/
      _layout.tsx
      index.tsx
    src/
      auth/
        deeplink.ts
      lib/
        supabase.ts
    app.config.ts
    metro.config.js
    package.json
```

Notes for Claude-Code
- Prefer Option A (apps/mobile) to avoid workspace churn.
- Only add shared imports from packages/* that are UI-agnostic (types, utils, domain logic).
- Leave Svelte UI in web; create `ui-native` later if needed.
- If anything fails, start by clearing caches and checking metro.config.js.

---

## Claude's Implementation Analysis & Phased Execution Plan

### Current State Assessment
✅ **Strengths of this plan:**
- Well-structured monorepo integration with pnpm
- Proper Metro config for shared packages
- Auth deep linking handled correctly
- Supabase client setup matches web architecture
- EAS build configuration included

⚠️ **Implementation considerations:**
- Need to verify shared packages compatibility with React Native
- Database types from `packages/database` should work out-of-the-box
- UI components will need native equivalents
- Stripe integration needs RN-specific setup

### Phased Implementation Strategy

#### **Phase 0: Foundation Setup (2-3 hours)**
*Goal: Get mobile app running with basic auth*

**Tasks:**
1. **Scaffold base app**
   - Run `pnpm dlx create-expo-app apps/mobile --template blank-typescript`
   - Configure package.json with correct scripts and dependencies
   - Set up Metro config for monorepo compatibility

2. **Environment & config**
   - Create app.config.ts with proper env exposure
   - Verify `.env.local` has all required Supabase keys
   - Test env variables are accessible in app

3. **Routing foundation**
   - Install Expo Router and dependencies
   - Create basic _layout.tsx and index.tsx
   - Test navigation works on device/simulator

4. **Supabase integration**
   - Install Supabase RN client + AsyncStorage
   - Create supabase.ts client with proper auth storage
   - Implement deep link auth handler
   - Test magic link flow end-to-end

**Success criteria:**
- App boots without errors
- Basic navigation works
- Magic link auth completes successfully
- Web build remains unaffected

#### **Phase 1: Core Functionality (1-2 weeks)**
*Goal: Match core web features with mobile-optimized UX*

**Tasks:**
1. **Shared code integration**
   - Import database types from `packages/database`
   - Create mobile-specific type utilities if needed
   - Test shared utilities work correctly

2. **Navigation structure**
   - Implement tab navigation (Browse, Sell, Profile)
   - Add stack navigation for detail screens
   - Create onboarding flow for new users

3. **Product browsing**
   - Product list with infinite scroll
   - Search and filter functionality
   - Category navigation
   - Image optimization for mobile

4. **Authentication screens**
   - Login/signup screens
   - Profile management
   - Settings screen

**Success criteria:**
- Core user flows work smoothly
- Performance matches mobile targets
- UI feels native and responsive

#### **Phase 2: Commerce Features (1-2 weeks)**
*Goal: Complete buying/selling functionality*

**Tasks:**
1. **Product management**
   - Sell item flow with camera integration
   - Image upload and compression
   - Product editing and management

2. **Purchasing flow**
   - Product detail screens
   - Shopping cart functionality
   - Stripe payment integration (RN-specific)
   - Order management

3. **Messaging system**
   - Chat interface for buyer-seller communication
   - Push notifications setup
   - Message status and delivery

4. **User profiles**
   - Public profile views
   - Rating and review system
   - Following/followers

**Success criteria:**
- Complete purchase flows work
- Payment processing is secure
- Chat system is reliable

#### **Phase 3: Mobile-Specific Features (1 week)**
*Goal: Leverage mobile platform capabilities*

**Tasks:**
1. **Platform features**
   - Camera integration for listing items
   - Photo editing and filters
   - Push notifications for messages/orders
   - Offline capability for browsing

2. **Performance optimization**
   - Image caching and lazy loading
   - Bundle size optimization
   - Memory usage optimization
   - Battery usage optimization

3. **App store preparation**
   - App icons and splash screens
   - Store listing assets
   - Privacy policy integration
   - Terms of service

**Success criteria:**
- App performs excellently on target devices
- Ready for app store submission
- All platform guidelines met

#### **Phase 4: Launch & Optimization (Ongoing)**
*Goal: Successful mobile app launch and iteration*

**Tasks:**
1. **Testing & QA**
   - Comprehensive device testing
   - Performance testing on low-end devices
   - User acceptance testing
   - Security audit

2. **Deploy & monitor**
   - EAS build and store deployment
   - Analytics and crash reporting
   - Performance monitoring
   - User feedback collection

3. **Iteration based on usage**
   - A/B testing for key flows
   - Performance optimizations
   - Feature additions based on data
   - Bug fixes and improvements

### Technical Risk Mitigation

**High Risk:**
- **Metro/pnpm compatibility**: Thoroughly test shared package imports
- **Stripe RN integration**: May need different implementation than web
- **Image handling**: Mobile has different constraints than web

**Medium Risk:**  
- **Deep linking**: Test across different app states and OS versions
- **Performance**: Monitor bundle size and runtime performance closely
- **Auth persistence**: Ensure session handling is robust

**Low Risk:**
- **Supabase client**: Well-tested RN integration
- **Expo Router**: Stable and well-documented
- **Basic UI components**: React Native has mature ecosystem

### Resource Requirements

**Development time:** 6-8 weeks total
**Team size:** 1-2 developers  
**Testing devices:** iOS simulator + 2-3 Android devices
**External services:** EAS Build subscription, App Store/Play Store accounts

### Success Metrics

**Technical:**
- App startup time: <3 seconds
- Bundle size: <50MB
- Crash rate: <1%
- Store rating: >4.0 stars

**Business:**
- Mobile conversion rate: Match or exceed web
- User retention: >70% day-1, >30% day-7
- Feature parity: 95% of core web functionality

This implementation plan balances rapid delivery with quality, focusing on core user value first while building a solid technical foundation for long-term success.

---

## Codex Review & Additions (Under Claude's Plan)

What follows tightens integration details for Expo + pnpm, reduces risk on payments and notifications, and adds concrete, low-effort improvements per phase.

### High-Impact Improvements
- Expo Router plugin: add to `apps/mobile/app.config.ts` for better linking and prebuild config.
  ```ts
  // inside export default(): ExpoConfig => ({ ... })
  plugins: [
    'expo-router',
  ],
  ```
- Environment variables: prefer `EXPO_PUBLIC_*` for bundler-time exposure (works across EAS Update/Build) and keep `extra` as an optional fallback.
  ```sh
  # .env.local
  EXPO_PUBLIC_SUPABASE_URL=...
  EXPO_PUBLIC_SUPABASE_ANON_KEY=...
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
  ```
  Then read with `process.env.EXPO_PUBLIC_*` in the app. You can keep `extra` for EAS-managed configs and migrate gradually.
- Stripe on native: use `@stripe/stripe-react-native` (not `@stripe/stripe-js`). Add plugin and plan an ephemeral key endpoint.
  ```sh
  pnpm --filter mobile add @stripe/stripe-react-native
  ```
  ```ts
  // app.config.ts
  plugins: [
    'expo-router',
    '@stripe/stripe-react-native',
  ],
  ```
  Server: implement an endpoint to create ephemeral keys/payment intents for mobile.
- Notifications: adopt `expo-notifications` now to avoid retrofitting later.
  ```sh
  pnpm --filter mobile add expo-notifications
  ```
  ```ts
  // app.config.ts
  plugins: [
    'expo-router',
    '@stripe/stripe-react-native',
    'expo-notifications',
  ],
  ```
- Images & uploads: prefer `expo-image` for performant caching and `expo-file-system` for camera/file uploads to Supabase Storage.

### Execution Tweaks by Phase
- Phase 0
  - Add `plugins: ['expo-router']` and switch env to `EXPO_PUBLIC_*` (or support both `extra` and `EXPO_PUBLIC_*`).
  - Add `expo-dev-client` for faster native testing during Phase 1/2.
    ```sh
    pnpm --filter mobile add -D expo-dev-client
    ```
- Phase 1
  - Navigation: consider a bottom tabs layout via Expo Router `(tabs)` convention for fast discoverability.
  - Shared packages: explicitly mark any shared pkg using `","type": "module"` and avoid Node APIs. Ensure `main` points to `src/index.ts`.
  - Images: replace `<Image>` with `expo-image` `<Image />` for caching.
- Phase 2
  - Payments: integrate `@stripe/stripe-react-native` with a backend endpoint that returns client secrets/ephemeral keys.
  - Messaging: use Supabase Realtime for MVP; add `expo-notifications` for push on new messages/orders.
  - Uploads: compress with `expo-image` transforms or `expo-image-manipulator` before upload to Storage.
- Phase 3
  - Offline: cache lists locally with SQLite (`expo-sqlite`) or AsyncStorage; hydrate on launch.
  - Performance: enable Hermes (default) and keep bundle lean; split large screens.
- Phase 4
  - Monitoring: add `sentry-expo` for error/crash reporting.
    ```sh
    pnpm --filter mobile add sentry-expo
    ```
    ```ts
    // app.config.ts
    plugins: [
      'expo-router',
      '@stripe/stripe-react-native',
      'expo-notifications',
      'sentry-expo',
    ],
    ```
  - OTA updates: leverage `eas update` for fast fixes without store review.

### Monorepo + pnpm Safeguards
- Ensure `metro.config.js` contains `disableHierarchicalLookup = true` and both nodeModulesPaths (already included).
- If any native lib resolves two copies due to hoisting, add `pnpm.overrides` to align versions across mobile + root.
- Keep `packages/ui` out of mobile; create `packages/ui-native` if needed.

### Auth Deep Link Checklist
- Add `driplo://auth/callback` to Supabase redirect URLs allowlist.
- Verify both cold start and warm start flows work on iOS/Android.
- For email magic links, ensure your backend sends `emailRedirectTo` with the custom scheme in mobile contexts.

### Actionable Next Steps (1 hour)
1. Add Expo plugins in `apps/mobile/app.config.ts` per above.
2. Switch to `EXPO_PUBLIC_*` env or support both patterns; verify in dev.
3. Install `@stripe/stripe-react-native` and `expo-notifications` to unblock Phase 2.
4. Decide on tabs layout using Expo Router; scaffold `(tabs)`.
5. Add `expo-dev-client` for faster native debug cycles.
