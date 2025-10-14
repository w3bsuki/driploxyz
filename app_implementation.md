# Driplo Mobile App - Implementation Guide

**Version:** 1.0  
**Last Updated:** October 13, 2025  
**Estimated Timeline:** 6-8 weeks (single full-time developer)

> **Prerequisites:**
> - Node.js 20.19.x installed
> - pnpm 9.x installed globally
> - Expo CLI (automatically installed via `npx`)
> - Apple Developer account (for iOS) + Google Play account (for Android)
> - Supabase project with existing database schema
> - Git repository access

---

## 📋 Implementation Phases

### **Phase 0: Monorepo Preparation** (1 day)

#### Task 0.1: Configure pnpm for React Native compatibility
**Goal:** Ensure dependency hoisting works with React Native packages

```bash
# From repository root
cd K:\driplo-turbo-1

# Create/update .npmrc
echo "node-linker=hoisted" > .npmrc
echo "shamefully-hoist=true" >> .npmrc
echo "strict-peer-dependencies=false" >> .npmrc
```

**Why:** React Native 0.82 + Expo SDK 54 support isolated deps, but many RN community packages still expect hoisted node_modules.

**Validation:**
- [x] `.npmrc` file exists in root
- [x] Contains `node-linker=hoisted`

---

#### Task 0.2: Update workspace configuration
**Goal:** Add mobile app to pnpm workspace

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Validation:**
- [ ] `pnpm-workspace.yaml` includes `apps/*`
- [ ] Run `pnpm install` from root without errors

---

#### Task 0.3: Add React 19.1 resolution
**Goal:** Force single React version across monorepo

```json
// package.json (root)
{
  "name": "driplo-turbo",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "resolutions": {
    "react": "^19.1.0",
    "react-native": "0.82.0"
  },
  "engines": {
    "node": ">=20.19.0 <21",
    "pnpm": ">=9.0.0"
  }
}
```

**Validation:**
- [ ] Root `package.json` has resolutions
- [ ] Run `pnpm why react` - should show single version

---

#### Task 0.4: Update Turborepo config
**Goal:** Add mobile app to build pipeline

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**", ".expo/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "mobile#dev": {
      "cache": false,
      "persistent": true
    },
    "mobile#build": {
      "outputs": ["dist/**", ".expo/**"],
      "dependsOn": ["^build"]
    }
  }
}
```

**Validation:**
- [ ] `turbo.json` includes mobile tasks
- [ ] Run `pnpm turbo build --dry` to verify pipeline

---

### **Phase 1: Expo App Initialization** (2-3 days)

#### Task 1.1: Create Expo app with Expo Router
**Goal:** Scaffold mobile app with file-based routing

```bash
# From repository root
pnpm create expo-app@latest apps/mobile --template

# When prompted:
# - Select "Navigation (Expo Router)" template
# - Choose TypeScript
```

**Expected structure:**
```
apps/mobile/
├── app/              # Expo Router screens (file-based routing)
│   ├── (tabs)/      # Tab navigator
│   ├── _layout.tsx  # Root layout
│   └── +not-found.tsx
├── assets/
├── components/
├── constants/
├── app.json         # Expo config
├── package.json
└── tsconfig.json
```

**Validation:**
- [ ] Directory `apps/mobile` exists
- [ ] `app.json` exists with correct app slug
- [ ] Run `cd apps/mobile && pnpm start` successfully

---

#### Task 1.2: Configure app.json for production
**Goal:** Set up app metadata and EAS configuration

```json
// apps/mobile/app.json
{
  "expo": {
    "name": "Driplo",
    "slug": "driplo-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "driplo",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.driplo.app",
      "associatedDomains": ["applinks:app.driplo.xyz"],
      "infoPlist": {
        "NSCameraUsageDescription": "Upload photos of items you want to sell",
        "NSPhotoLibraryUsageDescription": "Choose photos from your library"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.driplo.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "app.driplo.xyz",
              "pathPrefix": "/"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ],
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Driplo to access your camera to take photos."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow Driplo to access your photos."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID"
      }
    }
  }
}
```

**Validation:**
- [ ] `app.json` configured with correct bundle IDs
- [ ] Scheme matches universal link domain
- [ ] All required plugins listed

---

#### Task 1.3: Install core dependencies
**Goal:** Add essential packages for app functionality

```bash
cd apps/mobile

# Core Expo + React Native
pnpm add expo@~54.0.0 react@19.1.0 react-native@0.82.0

# Navigation
pnpm add expo-router@~5.0.0 expo-linking expo-constants

# UI & Styling
pnpm add nativewind@^4.0.0 tailwindcss@^3.4.0
pnpm add react-native-reanimated@~3.0.0 react-native-gesture-handler@~2.0.0
pnpm add react-native-safe-area-context@~4.0.0
pnpm add expo-system-ui expo-status-bar

# State & Data
pnpm add zustand@^5.0.0
pnpm add @tanstack/react-query@^5.0.0
pnpm add react-hook-form@^7.0.0 zod@^3.0.0

# Supabase
pnpm add @supabase/supabase-js@^2.0.0
pnpm add @react-native-async-storage/async-storage@^2.0.0

# Media
pnpm add expo-image-picker expo-camera expo-image-manipulator
pnpm add expo-file-system

# Auth
pnpm add expo-auth-session expo-crypto expo-web-browser

# Notifications
pnpm add expo-notifications@~0.32.0

# Dev dependencies
pnpm add -D @types/react @types/react-native
pnpm add -D typescript@~5.0.0
pnpm add -D @babel/core
```

**Validation:**
- [ ] All packages installed without peer dependency warnings
- [ ] `package.json` shows correct versions
- [ ] Run `pnpm expo doctor` to check for issues

---

#### Task 1.4: Configure NativeWind (Tailwind for RN)
**Goal:** Set up Tailwind CSS styling system

```javascript
// apps/mobile/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Import from web design tokens if available
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#10b981',
      },
    },
  },
  plugins: [],
};
```

```javascript
// apps/mobile/babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }]
    ],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
```

```typescript
// apps/mobile/app/_layout.tsx
import '../global.css'; // Import Tailwind styles
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
```

```css
/* apps/mobile/global.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Validation:**
- [ ] `tailwind.config.js` created
- [ ] `babel.config.js` updated
- [ ] `global.css` imported in `_layout.tsx`
- [ ] Test Tailwind class (e.g., `className="bg-blue-500"`) renders

---

#### Task 1.5: Configure TypeScript for monorepo
**Goal:** Enable workspace package imports

```json
// apps/mobile/tsconfig.json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@repo/*": ["../../packages/*/src"],
      "@mobile/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"],
  "exclude": ["node_modules"]
}
```

**Validation:**
- [ ] TypeScript compiles without errors
- [ ] Workspace imports resolve (e.g., `import { ... } from '@repo/database'`)

---

### **Phase 2: Shared Package Integration** (2 days)

#### Task 2.1: Create mobile-shared package
**Goal:** Centralize mobile-specific utilities

```bash
mkdir -p packages/mobile-shared/src/{components,hooks,utils,types}
cd packages/mobile-shared
pnpm init
```

```json
// packages/mobile-shared/package.json
{
  "name": "@repo/mobile-shared",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "lint": "eslint src",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-native": "0.82.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "typescript": "^5.0.0"
  }
}
```

```typescript
// packages/mobile-shared/src/index.ts
export * from './hooks';
export * from './utils';
export * from './types';
```

**Validation:**
- [ ] Package structure created
- [ ] Can import from `@repo/mobile-shared` in mobile app

---

#### Task 2.2: Link existing workspace packages
**Goal:** Reuse database types, i18n, business logic

```json
// apps/mobile/package.json
{
  "dependencies": {
    "@repo/database": "workspace:*",
    "@repo/i18n": "workspace:*",
    "@repo/domain": "workspace:*",
    "@repo/mobile-shared": "workspace:*"
  }
}
```

```bash
cd apps/mobile
pnpm install
```

**Validation:**
- [ ] Run `pnpm why @repo/database` - resolves to workspace
- [ ] TypeScript finds types from workspace packages

---

#### Task 2.3: Create Supabase client for mobile
**Goal:** Initialize Supabase with AsyncStorage

```typescript
// packages/mobile-shared/src/lib/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Handled by deep linking
  },
});
```

```bash
# Create .env for local development
cat > apps/mobile/.env << EOF
EXPO_PUBLIC_SUPABASE_URL=https://koowfhsaqmarfdkwsfiz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
EOF
```

**Validation:**
- [ ] Supabase client initializes without errors
- [ ] Can call `supabase.auth.getSession()`
- [ ] `.env` file created (add to `.gitignore`)

---

#### Task 2.4: Create auth provider
**Goal:** Manage authentication state globally

```typescript
// packages/mobile-shared/src/providers/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Validation:**
- [ ] Provider wraps app in `_layout.tsx`
- [ ] `useAuth()` hook returns user/session
- [ ] Auth state persists across app restarts

---

### **Phase 3: Authentication & Deep Linking** (3-4 days)

#### Task 3.1: Configure OAuth providers
**Goal:** Enable Apple/Google sign-in via Supabase

```bash
# In Supabase Dashboard:
# 1. Go to Authentication > Providers
# 2. Enable "Apple" and "Google"
# 3. Configure redirect URLs:
#    - iOS: driplo://auth/callback
#    - Android: driplo://auth/callback
#    - Web: https://app.driplo.xyz/auth/callback
```

**Validation:**
- [ ] Apple Sign In configured in Supabase
- [ ] Google OAuth configured in Supabase
- [ ] Redirect URLs match app scheme

---

#### Task 3.2: Implement OAuth flow
**Goal:** Sign in with Apple/Google using expo-auth-session

```typescript
// apps/mobile/app/(auth)/sign-in.tsx
import { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@repo/mobile-shared';
import { useAuth } from '@repo/mobile-shared/providers';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const signInWithApple = async () => {
    const redirectTo = makeRedirectUri({ path: '/auth/callback' });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      console.error('Apple Sign In Error:', error);
      return;
    }

    // Open OAuth flow
    if (data?.url) {
      await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    }
  };

  const signInWithGoogle = async () => {
    const redirectTo = makeRedirectUri({ path: '/auth/callback' });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: false,
      },
    });

    if (error) {
      console.error('Google Sign In Error:', error);
      return;
    }

    if (data?.url) {
      await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-6 bg-white">
      <Text className="text-3xl font-bold mb-8">Welcome to Driplo</Text>
      
      <Pressable
        onPress={signInWithApple}
        className="w-full bg-black rounded-lg py-4 mb-4"
      >
        <Text className="text-white text-center font-semibold">
          Continue with Apple
        </Text>
      </Pressable>

      <Pressable
        onPress={signInWithGoogle}
        className="w-full bg-blue-500 rounded-lg py-4"
      >
        <Text className="text-white text-center font-semibold">
          Continue with Google
        </Text>
      </Pressable>
    </View>
  );
}
```

**Validation:**
- [ ] Tapping "Sign In with Apple" opens OAuth flow
- [ ] After auth, redirects back to app
- [ ] User session persists

---

#### Task 3.3: Handle deep link callbacks
**Goal:** Process OAuth redirect after authentication

```typescript
// apps/mobile/app/auth/callback.tsx
import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@repo/mobile-shared';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract tokens from URL params
        const { access_token, refresh_token } = params;

        if (access_token && refresh_token) {
          // Set session from tokens
          const { error } = await supabase.auth.setSession({
            access_token: access_token as string,
            refresh_token: refresh_token as string,
          });

          if (error) throw error;

          // Redirect to main app
          router.replace('/(tabs)');
        } else {
          // No tokens, redirect to sign in
          router.replace('/(auth)/sign-in');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/(auth)/sign-in');
      }
    };

    handleCallback();
  }, [params]);

  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" />
      <Text className="mt-4">Completing sign in...</Text>
    </View>
  );
}
```

**Validation:**
- [ ] After OAuth, app opens to callback screen
- [ ] Session is set correctly
- [ ] Redirects to main app (tabs)

---

#### Task 3.4: Configure universal links (iOS)
**Goal:** Enable seamless deep linking from web → app

```json
// For iOS: Host AASA file at https://app.driplo.xyz/.well-known/apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.driplo.app",
        "paths": ["/auth/callback", "/product/*", "/messages/*"]
      }
    ]
  }
}
```

**Android:** Configure Digital Asset Links at `https://app.driplo.xyz/.well-known/assetlinks.json`

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.driplo.app",
      "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
    }
  }
]
```

**Validation:**
- [ ] AASA file hosted and validates (use Apple's AASA validator)
- [ ] Android assetlinks file hosted
- [ ] Tapping `https://app.driplo.xyz/auth/callback` opens app

---

### **Phase 4: EAS & CI/CD Setup** (1-2 days)

#### Task 4.1: Initialize EAS
**Goal:** Configure Expo Application Services

```bash
cd apps/mobile
pnpm exec eas init

# Create EAS project (prompts for login)
# Store project ID in app.json
```

```json
// apps/mobile/eas.json
{
  "cli": {
    "version": ">= 16.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "channel": "preview"
    },
    "production": {
      "channel": "production",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "YOUR_ASC_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account.json",
        "track": "production"
      }
    }
  },
  "update": {
    "channel": "production"
  }
}
```

**Validation:**
- [ ] EAS CLI installed
- [ ] Project created on expo.dev
- [ ] `eas.json` configured

---

#### Task 4.2: Configure environment secrets
**Goal:** Store sensitive keys securely in EAS

```bash
# Set Supabase URL
pnpm exec eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://koowfhsaqmarfdkwsfiz.supabase.co"

# Set Supabase Anon Key
pnpm exec eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your_anon_key"

# Set Sentry DSN (for crash reporting)
pnpm exec eas secret:create --scope project --name SENTRY_DSN --value "your_sentry_dsn"
```

**Validation:**
- [ ] Secrets visible in EAS dashboard
- [ ] Builds can access secrets

---

#### Task 4.3: Run first development build
**Goal:** Create installable development client

```bash
cd apps/mobile

# iOS development build (simulator)
pnpm exec eas build --profile development --platform ios

# Android development build (APK)
pnpm exec eas build --profile development --platform android

# Wait for builds to complete (~10-20 min)
```

**Validation:**
- [ ] iOS simulator build installs
- [ ] Android APK installs on device
- [ ] Can run `pnpm start` and connect

---

#### Task 4.4: Set up GitHub Actions CI
**Goal:** Automate preview builds on PR

```yaml
# .github/workflows/mobile-preview.yml
name: Mobile App Preview Build

on:
  pull_request:
    branches: [main]
    paths:
      - 'apps/mobile/**'
      - 'packages/mobile-shared/**'
      - 'packages/database/**'

jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20.19'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Build preview
        run: |
          cd apps/mobile
          pnpm exec eas build --profile preview --platform all --non-interactive --no-wait
```

**Validation:**
- [ ] Workflow file committed
- [ ] PR triggers preview build
- [ ] Build URL posted in PR comments

---

### **Phase 5: Core Features Implementation** (4-6 weeks)

> **Note:** Detailed tasks for each feature below. Implement iteratively.

---

#### **Feature 5.1: Home Feed & Product Listings**

##### Task 5.1.1: Create home screen layout
```typescript
// apps/mobile/app/(tabs)/index.tsx
import { View, FlatList, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@repo/mobile-shared';
import { ProductCard } from '@repo/mobile-shared/components';

export default function HomeScreen() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'feed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*, profiles(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProductCard product={item} />}
      className="flex-1 bg-gray-50"
      contentContainerClassName="p-4"
    />
  );
}
```

**Validation:**
- [ ] Products load from Supabase
- [ ] FlatList renders smoothly
- [ ] Tapping product navigates to detail

---

##### Task 5.1.2: Create ProductCard component
```typescript
// packages/mobile-shared/src/components/ProductCard.tsx
import { View, Text, Image, Pressable } from 'react-native';
import { router } from 'expo-router';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    currency: string;
    images: Array<{ url: string }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
    >
      <Image
        source={{ uri: product.images[0]?.url }}
        className="w-full h-48"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-lg font-semibold mb-2" numberOfLines={2}>
          {product.title}
        </Text>
        <Text className="text-xl font-bold text-blue-600">
          {product.currency} {product.price}
        </Text>
      </View>
    </Pressable>
  );
}
```

**Validation:**
- [ ] Card displays image, title, price
- [ ] Tapping card navigates to product detail
- [ ] Renders 60fps in FlatList

---

#### **Feature 5.2: Product Detail Screen**

##### Task 5.2.1: Create dynamic product route
```typescript
// apps/mobile/app/product/[id].tsx
import { View, Text, ScrollView, Image, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@repo/mobile-shared';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*, profiles(*), item_images(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !product) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: product.title }} />
      <ScrollView className="flex-1 bg-white">
        <Image
          source={{ uri: product.item_images[0]?.url }}
          className="w-full h-96"
          resizeMode="cover"
        />
        <View className="p-6">
          <Text className="text-2xl font-bold mb-2">{product.title}</Text>
          <Text className="text-3xl font-bold text-blue-600 mb-4">
            {product.currency} {product.price}
          </Text>
          <Text className="text-gray-700 mb-6">{product.description}</Text>

          <Pressable
            onPress={() => router.push(`/messages?product=${id}`)}
            className="bg-blue-600 rounded-lg py-4"
          >
            <Text className="text-white text-center font-semibold text-lg">
              Message Seller
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}
```

**Validation:**
- [ ] Product loads from Supabase
- [ ] Images display correctly
- [ ] "Message Seller" button navigates

---

#### **Feature 5.3: Sell Flow (Create Listing)**

##### Task 5.3.1: Create multi-step sell screen
```typescript
// apps/mobile/app/(tabs)/sell.tsx
import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { supabase } from '@repo/mobile-shared';

export default function SellScreen() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map((a) => a.uri)]);
    }
  };

  const createListing = async () => {
    // Upload images to Supabase Storage
    const uploadedImages = await Promise.all(
      images.map(async (uri) => {
        const filename = `${Date.now()}-${Math.random()}.jpg`;
        const { data, error } = await supabase.storage
          .from('item-images')
          .upload(filename, {
            uri,
            type: 'image/jpeg',
            name: filename,
          } as any);

        if (error) throw error;
        return data.path;
      })
    );

    // Create item in database
    const { data: item, error } = await supabase
      .from('items')
      .insert({
        title,
        price: parseFloat(price),
        description,
        currency: 'BGN',
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    // Link images to item
    await supabase.from('item_images').insert(
      uploadedImages.map((path, index) => ({
        item_id: item.id,
        url: path,
        sort: index,
      }))
    );

    // Navigate to product detail
    router.replace(`/product/${item.id}`);
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-6">List an Item</Text>

      <Pressable
        onPress={pickImage}
        className="bg-gray-100 rounded-lg h-48 justify-center items-center mb-6"
      >
        <Text className="text-gray-600">
          {images.length > 0 ? `${images.length} photos` : 'Add photos'}
        </Text>
      </Pressable>

      {/* Add TextInput fields for title, price, description */}

      <Pressable
        onPress={createListing}
        className="bg-blue-600 rounded-lg py-4"
      >
        <Text className="text-white text-center font-semibold text-lg">
          Publish Listing
        </Text>
      </Pressable>
    </ScrollView>
  );
}
```

**Validation:**
- [ ] Can pick images from library
- [ ] Images upload to Supabase Storage
- [ ] Listing created in database
- [ ] Redirects to new product detail

---

#### **Feature 5.4: Messages (Chat)**

##### Task 5.4.1: Set up Supabase Realtime for chat
```typescript
// packages/mobile-shared/src/hooks/useChat.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useChat(chatId: string) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const sendMessage = async (body: string) => {
    const { error } = await supabase.from('messages').insert({
      chat_id: chatId,
      body,
      type: 'text',
    });

    if (error) console.error('Send message error:', error);
  };

  return { messages, sendMessage };
}
```

**Validation:**
- [ ] Messages load in real-time
- [ ] Sending message appears instantly
- [ ] Realtime subscription cleans up on unmount

---

#### **Feature 5.5: Push Notifications**

##### Task 5.5.1: Configure Expo Notifications
```typescript
// packages/mobile-shared/src/lib/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Save token to Supabase
  await supabase.from('device_tokens').upsert({
    user_id: (await supabase.auth.getUser()).data.user?.id,
    expo_push_token: token,
    last_seen_at: new Date().toISOString(),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return token;
}
```

**Validation:**
- [ ] Permission prompt appears on first launch
- [ ] Token saved to Supabase
- [ ] Test notification received from Expo push tool

---

### **Phase 6: Testing & QA** (1 week)

#### Task 6.1: Unit tests
```bash
cd apps/mobile
pnpm add -D jest @testing-library/react-native

# Run tests
pnpm test
```

#### Task 6.2: E2E tests (optional)
```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# Create test flow
# maestro-tests/auth-flow.yaml
```

#### Task 6.3: Manual QA checklist
- [ ] Sign in with Apple works
- [ ] Sign in with Google works
- [ ] Can browse products
- [ ] Can view product details
- [ ] Can create listing with photos
- [ ] Can send messages
- [ ] Push notifications arrive
- [ ] Deep links work (web → app)
- [ ] Offline mode shows cached data
- [ ] App doesn't crash on slow network

---

### **Phase 7: Production Release** (1 week)

#### Task 7.1: Build production binaries
```bash
cd apps/mobile

# iOS production build
pnpm exec eas build --profile production --platform ios

# Android production build
pnpm exec eas build --profile production --platform android
```

#### Task 7.2: Submit to App Store
```bash
pnpm exec eas submit --platform ios
```

#### Task 7.3: Submit to Google Play
```bash
pnpm exec eas submit --platform android
```

#### Task 7.4: Configure OTA updates
```bash
# Publish update to production channel
pnpm exec eas update --branch production --message "Initial release"
```

---

## 📊 Success Metrics

### Technical KPIs
- [ ] App cold start < 2.5s on mid-range device
- [ ] Crash-free rate > 99.5%
- [ ] API response time (p95) < 500ms
- [ ] Image upload < 5s on 4G

### Product KPIs
- [ ] 7-day retention > 40%
- [ ] Listing creation rate > 15% of active users
- [ ] Message response time < 1 hour
- [ ] Search → Purchase conversion > 2%

---

## 🚨 Troubleshooting

### Common Issues

**Issue:** Metro bundler can't resolve workspace packages
```bash
# Solution: Clear Metro cache
pnpm expo start --clear
```

**Issue:** iOS build fails with "Duplicate symbol" error
```bash
# Solution: Ensure hoisted node_modules
cat .npmrc
# Should contain: node-linker=hoisted
```

**Issue:** Android build fails with "AAPT2 error"
```bash
# Solution: Clean Android build
cd apps/mobile/android
./gradlew clean
```

**Issue:** Deep links don't open app
```bash
# iOS: Validate AASA file
https://branch.io/resources/aasa-validator/

# Android: Validate assetlinks
https://developers.google.com/digital-asset-links/tools/generator
```

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native 0.82 Release Notes](https://reactnative.dev/blog/2025/10/08/react-native-0.82)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)
- [Supabase React Native Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/react-native)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

---

## ✅ Final Checklist

Before considering the app "complete":

- [ ] All phases 0-7 tasks completed
- [ ] App published to App Store & Google Play
- [ ] OTA update channel configured
- [ ] Sentry crash reporting active
- [ ] Analytics tracking events
- [ ] Documentation updated (README, API docs)
- [ ] Team trained on EAS workflow
- [ ] Monitoring dashboard set up
- [ ] Rollback procedure documented
- [ ] Post-launch support plan ready

---

**Congratulations!** 🎉 Your mobile app is now live. Monitor metrics closely for the first 2 weeks and iterate based on user feedback.
