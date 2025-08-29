# Driplo Mobile Setup (Turborepo)

This guide adds a first‑class React Native (Expo) app to the monorepo with safe isolation from `apps/web`. It also includes an optional Capacitor path for a fast store presence after the web MVP.

If you follow these steps in order, nothing in `apps/web` will break.

---

## 0) Decision & Timing

- Primary path: React Native (Expo) inside the Turborepo.
- Timing: Ship web MVP first; start RN in parallel only if you have capacity.
- Capacitor: Optional “v0” wrapper after web launch if you need store presence in 1–2 weeks; treat as temporary.

---

## 1) Prerequisites

- Node 18+ (repo already set) and pnpm.
- Android Studio and/or Xcode (for local device builds).
- Expo tooling comes with the generated app (no global install required).
- Monorepo already configured via `pnpm-workspace.yaml` and `turbo.json`.

---

## 2) Create the React Native app (Expo)

Run from the repo root:

```sh
pnpm dlx create-expo-app apps/mobile --template blank-typescript
```

This creates `apps/mobile` with its own `package.json`, fully isolated from `apps/web`.

Verify install:

```sh
pnpm install
pnpm --filter mobile start
```

If the Expo Dev Tools open and the app boots on web or simulator, the scaffold is good.

---

## 3) Turborepo tasks (optional convenience)

You can run all scripts using `pnpm --filter mobile ...` without changing `turbo.json`. If you prefer consistency and visibility in Turbo UI, add the following tasks.

File: `turbo.json`

```jsonc
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",
  "tasks": {
    // existing tasks …
    "start": { "cache": false, "persistent": true },
    "ios":   { "cache": false },
    "android": { "cache": false }
  }
}
```

Usage:

```sh
pnpm --filter mobile start
pnpm --filter mobile ios
pnpm --filter mobile android
```

---

## 4) Metro configuration for monorepo + pnpm

Ensure Metro can resolve shared packages in `packages/*` and the root `node_modules`.

File: `apps/mobile/metro.config.js`

```js
// apps/mobile/metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('metro-config').ConfigT} */
const config = getDefaultConfig(projectRoot);

// 1) Watch the whole workspace so changes in packages/* are picked up
config.watchFolders = [workspaceRoot];

// 2) Resolve modules from the app and the workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3) Avoid hoisted/duplicate resolutions that can break RN
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
```

---

## 5) Babel config

If your template includes a minimal Babel config, keep it and add Reanimated only if you use it later.

File: `apps/mobile/babel.config.js`

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Add if you use Reanimated later:
      // 'react-native-reanimated/plugin',
    ],
  };
};
```

---

## 6) TypeScript config

Leave the generated `tsconfig.json` in `apps/mobile` as is. For shared packages, prefer publishing them as transpiled ESM/CJS or plain TS compiled by Metro (which handles TS out of the box).

Optional path aliases via Babel’s `module-resolver` can be added later when you introduce `packages/api` or `packages/types`.

---

## 7) Shared code strategy

Create shared packages incrementally to reuse logic between web and mobile:

- `packages/types` — shared TypeScript models (Product, User, Order...).
- `packages/api` — API client wrappers (Supabase queries, fetchers, validation).
- `packages/business-logic` — pure functions: pricing, validation, formatting.

Example publish config (for a new package):

File: `packages/types/package.json`

```json
{
  "name": "@driplo/types",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

You can import these directly in `apps/web` and `apps/mobile` once created.

---

## 8) Environment variables (Expo)

Expose the same public variables used by the web app via Expo config.

File: `apps/mobile/app.config.ts`

```ts
// apps/mobile/app.config.ts
import 'dotenv/config';
import type { ExpoConfig } from '@expo/config';

export default (): ExpoConfig => ({
  name: 'Driplo',
  slug: 'driplo',
  scheme: 'driplo',
  owner: undefined, // set if using EAS Org
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  splash: { image: './assets/splash.png', resizeMode: 'contain', backgroundColor: '#ffffff' },
  updates: { enabled: true },
  ios: { supportsTablet: false, bundleIdentifier: 'com.driplo.app' },
  android: { adaptiveIcon: { foregroundImage: './assets/adaptive-icon.png', backgroundColor: '#ffffff' }, package: 'com.driplo.app' },
  extra: {
    PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY,
    PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  plugins: [
    // add plugins here as you enable features, e.g., notifications, stripe, image-picker
  ],
});
```

Usage in app code:

```ts
import Constants from 'expo-constants';
const extra = Constants.expoConfig?.extra as any;
const SUPABASE_URL = extra?.PUBLIC_SUPABASE_URL;
```

Add `.env` entries at the repo root (values already used by web):

```env
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

---

## 9) Supabase client (React Native)

Install and configure Auth session storage for React Native:

```sh
pnpm --filter mobile add @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
```

File: `apps/mobile/src/lib/supabase.ts`

```ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as any;
const SUPABASE_URL = extra?.PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = extra?.PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## 10) Navigation (Expo Router)

Expo Router provides file‑based routing with deep linking out of the box.

```sh
pnpm --filter mobile add expo-router react-native-safe-area-context react-native-screens
```

Enable Router:

- Ensure `app.json/app.config.ts` includes `scheme: 'driplo'` (already set above).
- Update `apps/mobile/package.json`:

```json
{
  "name": "mobile",
  "private": true,
  "main": "expo-router/entry",
  // ... rest of the file
}
```

Create screens:

```
apps/mobile/app/_layout.tsx
apps/mobile/app/index.tsx
apps/mobile/app/login.tsx
```

`apps/mobile/app/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';

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

`apps/mobile/app/index.tsx`:

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

---

## 11) Payments (Stripe)

Install Stripe’s native SDK and add plugin in config.

```sh
pnpm --filter mobile add @stripe/stripe-react-native
```

Update `apps/mobile/app.config.ts` plugins:

```ts
plugins: [
  ["@stripe/stripe-react-native", { "merchantIdentifier": "merchant.com.driplo", "enableGooglePay": true }],
]
```

Usage (wrap app):

```tsx
import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';

const PUBLISHABLE_KEY = (Constants.expoConfig?.extra as any)?.PUBLIC_STRIPE_PUBLISHABLE_KEY;

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <StripeProvider publishableKey={PUBLISHABLE_KEY}>
      {children}
    </StripeProvider>
  );
}
```

Note: For payment sheets/Apple Pay/Google Pay, complete platform setup later.

---

## 12) Camera & Image Uploads

For listing creation, start with `expo-image-picker` (simpler) or use `expo-camera` for advanced control.

```sh
pnpm --filter mobile add expo-image-picker
```

Add plugin if needed and request permissions at runtime. Upload images to Supabase Storage via the same bucket your web uses.

---

## 13) Push Notifications (optional now, high impact later)

Use `expo-notifications` for push; add server logic to send via Expo or native APNs/FCM.

```sh
pnpm --filter mobile add expo-notifications
```

Add plugin in `app.config.ts` and follow Expo guide to set credentials. Start with local notifications, then wire remote pushes post‑MVP.

---

## 14) Deep Links

Already enabled with `scheme: 'driplo'`. To support universal/app links, add associated domains (iOS) and assetlinks (Android) later. Expo Router will convert routes to links automatically.

---

## 15) Running & building

- Dev menu:
  ```sh
  pnpm --filter mobile start
  ```
- iOS simulator:
  ```sh
  pnpm --filter mobile ios
  ```
- Android emulator:
  ```sh
  pnpm --filter mobile android
  ```

This does not affect `apps/web` at all.

---

## 16) Store readiness checklist (RN)

- App icon/splash finalized (all densities).
- App name/bundle IDs/release channel set.
- Privacy manifest (iOS) and permissions descriptions.
- Payments tested on device (Stripe PaymentSheet).
- Crash reporting (Sentry or Expo Updates logs) optional but recommended.
- E2E flows: sign up, login, create listing (camera), browse, favorite, checkout.

---

## 17) Optional: Capacitor wrapper for `apps/web` after web launch

Use only if you need rapid store presence in ~2–3 days.

1) Switch `apps/web` to a static build if not already (SvelteKit `adapter-static`) so you get a `build/` folder. Confirm by running:
   ```sh
   pnpm --filter web build
   ```
   Then inspect which directory contains the production web assets (commonly `build/`).

2) Add Capacitor to `apps/web`:
   ```sh
   pnpm --filter web add @capacitor/core @capacitor/ios @capacitor/android
   pnpm --filter web add -D @capacitor/cli
   ```

3) Initialize Capacitor inside `apps/web` (adjust `--web-dir` to your actual build output):
   ```sh
   cd apps/web
   npx cap init "Driplo" "com.driplo.app" --web-dir=build
   npx cap add ios
   npx cap add android
   ```

4) Build & sync:
   ```sh
   pnpm --filter web build
   npx cap copy
   npx cap open ios   # or: npx cap open android
   ```

5) Add minimal native features (push, share, camera) to improve store acceptance.

Caveats: WebView feel, gesture/scroll performance, and store review risk. Treat as temporary until RN is ready.

---

## 18) Suggested first milestones (RN)

- M1 (Day 1–2): Scaffold app, Supabase auth (email magic link/OTP), basic navigation.
- M2 (Week 1): Browse feed (read‑only), product details, favorites.
- M3 (Week 2): Listing flow with camera upload to Supabase Storage.
- M4 (Week 3–4): Payments integration, push notifications, polish.

---

## 19) Quick commands reference

- Start mobile: `pnpm --filter mobile start`
- iOS: `pnpm --filter mobile ios`
- Android: `pnpm --filter mobile android`
- Run web only: `pnpm --filter web dev`
- Build web: `pnpm --filter web build`

---

## 20) FAQ

- Will this break `apps/web`?
  - No. `apps/mobile` is a separate project. Only changes in shared `packages/*` can affect both, and TypeScript/build will catch issues.

- Monorepo + PNPM + RN gotchas?
  - Use the provided `metro.config.js` so Metro resolves shared packages and hoisted deps correctly.

- Why RN over Flutter?
  - Better TS/JS reuse with your stack, smoother team onboarding, strong ecosystem for Supabase/Stripe/Expo.

- When to use Capacitor?
  - Only if you must ship to stores immediately post‑web MVP; plan to sunset it once RN achieves feature parity.

---

By following this file verbatim, you can scaffold and run the mobile app today without interfering with the web app, and you’ll have a clear path to production‑ready native UX.

