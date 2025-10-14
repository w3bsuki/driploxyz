# Driplo Mobile App - Detailed Implementation Guide

**Version:** 1.0  
**Created:** October 13, 2025  
**Purpose:** Step-by-step implementation instructions for each phase

## 📋 Phase 0: Monorepo Preparation (1 day)

### Task 0.1: Configure .npmrc for React Native

Create/update `.npmrc` in the root directory:

```ini
# .npmrc
node-linker=hoisted
shamefully-hoist=true
strict-peer-dependencies=false
```

**Why:** React Native packages still expect hoisted dependencies despite Expo SDK 54 supporting isolated deps.

### Task 0.2: Update package.json with React Native resolutions

Update the root `package.json`:

```json
{
  "name": "driplo-turbo",
  "private": true,
  "packageManager": "pnpm@9.15.6",
  "engines": {
    "node": ">=22.12.0 <23"
  },
  "resolutions": {
    "react": "^19.1.0",
    "react-native": "0.82.0"
  },
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "mobile:dev": "pnpm --filter mobile dev",
    "mobile:build": "pnpm --filter mobile build",
    "mobile:start": "pnpm --filter mobile start"
  }
}
```

### Task 0.3: Update turbo.json with mobile tasks

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".svelte-kit/**", ".vercel/**", "dist/**", "build/**", ".expo/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "mobile#dev": {
      "cache": false,
      "persistent": true
    },
    "mobile#build": {
      "outputs": ["dist/**", ".expo/**"],
      "dependsOn": ["^build"]
    },
    "mobile#start": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Validation:**
- [ ] Run `pnpm install` without errors
- [ ] Run `pnpm turbo build --dry` to verify pipeline

## 📱 Phase 1: Expo App Initialization (2-3 days)

### Task 1.1: Create Expo app with Router

```bash
# From repository root
pnpm create expo-app@latest apps/mobile --template

# When prompted:
# - Select "Navigation (Expo Router)" template
# - Choose TypeScript
# - Enter "driplo-mobile" for app name
```

### Task 1.2: Configure app.json

Create `apps/mobile/app.json`:

```json
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

### Task 1.3: Install core dependencies

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

# Workspace dependencies
pnpm add @repo/database@workspace:*
pnpm add @repo/i18n@workspace:*
pnpm add @repo/domain@workspace:*
```

### Task 1.4: Configure NativeWind

Create `apps/mobile/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    '../packages/mobile-shared/src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Import design tokens from web app
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        accent: '#10b981',
        charcoal: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          500: '#64748b',
          900: '#0f172a',
        },
        indigo: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
        },
        burgundy: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        gold: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};
```

Create `apps/mobile/babel.config.js`:

```javascript
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

Create `apps/mobile/app/_layout.tsx`:

```typescript
import '../global.css'; // Import Tailwind styles
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@repo/mobile-shared/providers/AuthProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

Create `apps/mobile/global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Task 1.5: Configure TypeScript for monorepo

Create `apps/mobile/tsconfig.json`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
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
- [ ] Run `cd apps/mobile && pnpm start` successfully
- [ ] Tailwind classes render correctly
- [ ] TypeScript resolves workspace packages

## 📦 Phase 2: Shared Package Integration (2 days)

### Task 2.1: Create mobile-shared package

```bash
mkdir -p packages/mobile-shared/src/{components,hooks,lib,providers,utils,types}
cd packages/mobile-shared
pnpm init
```

Create `packages/mobile-shared/package.json`:

```json
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
    "@repo/database": "workspace:*",
    "@repo/i18n": "workspace:*",
    "@supabase/supabase-js": "^2.0.0",
    "@react-native-async-storage/async-storage": "^2.0.0",
    "@tanstack/react-query": "^5.0.0",
    "expo-notifications": "~0.32.0",
    "react": "^19.1.0",
    "react-native": "0.82.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "typescript": "^5.0.0"
  },
  "peerDependencies": {
    "expo-router": "*"
  }
}
```

Create `packages/mobile-shared/src/index.ts`:

```typescript
// Providers
export { AuthProvider } from './providers/AuthProvider';

// Hooks
export { useAuth } from './hooks/useAuth';
export { useChat } from './hooks/useChat';
export { useUpload } from './hooks/useUpload';

// Lib
export { supabase } from './lib/supabase';
export { registerForPushNotifications } from './lib/notifications';

// Components
export { ProductCard } from './components/ProductCard';
export { MessageBubble } from './components/MessageBubble';

// Utils
export * from './utils/formatting';
export * from './utils/validation';
export * from './utils/constants';
```

### Task 2.2: Create Supabase client

Create `packages/mobile-shared/src/lib/supabase.ts`:

```typescript
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

### Task 2.3: Create AuthProvider

Create `packages/mobile-shared/src/providers/AuthProvider.tsx`:

```typescript
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

### Task 2.4: Create Chat hook

Create `packages/mobile-shared/src/hooks/useChat.ts`:

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '@repo/database';

type Message = Database['public']['Tables']['messages']['Row'];

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    if (!conversationId) return;

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      content,
      message_type: 'text',
    });

    if (error) {
      console.error('Send message error:', error);
      throw error;
    }
  };

  return { messages, loading, sendMessage };
}
```

**Validation:**
- [ ] Can import from `@repo/mobile-shared` in mobile app
- [ ] Supabase client initializes without errors
- [ ] Auth provider wraps app correctly

## 🔐 Phase 3: Authentication & Deep Linking (3-4 days)

### Task 3.1: Configure OAuth providers in Supabase

In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable "Apple" and "Google"
3. Configure redirect URLs:
   - iOS: `driplo://auth/callback`
   - Android: `driplo://auth/callback`
   - Web: `https://app.driplo.xyz/auth/callback`

### Task 3.2: Create sign-in screen

Create `apps/mobile/app/(auth)/sign-in.tsx`:

```typescript
import { useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@repo/mobile-shared';
import { useAuth } from '@repo/mobile-shared';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { user, loading } = useAuth();

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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

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

### Task 3.3: Handle deep link callbacks

Create `apps/mobile/app/auth/callback.tsx`:

```typescript
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
        const { access_token, refresh_token } = params;

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: access_token as string,
            refresh_token: refresh_token as string,
          });

          if (error) throw error;

          router.replace('/(tabs)');
        } else {
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

### Task 3.4: Create tab navigation

Create `apps/mobile/app/(tabs)/_layout.tsx`:

```typescript
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#64748b',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: 'Sell',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Task 3.5: Configure universal links

For iOS, create `public/.well-known/apple-app-site-association`:

```json
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

For Android, create `public/.well-known/assetlinks.json`:

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
- [ ] OAuth flow opens in browser
- [ ] Deep links redirect back to app
- [ ] Session persists after authentication
- [ ] Tab navigation works correctly

## 🚀 Phase 4: EAS & CI/CD Setup (1-2 days)

### Task 4.1: Initialize EAS

```bash
cd apps/mobile
pnpm exec eas init

# Follow prompts to:
# 1. Login to Expo account
# 2. Create or link project
# 3. Store project ID in app.json
```

### Task 4.2: Configure EAS build profiles

Create `apps/mobile/eas.json`:

```json
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
      "android": {
        "buildType": "apk"
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

### Task 4.3: Configure environment secrets

```bash
# Set Supabase URL
pnpm exec eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://your-project.supabase.co"

# Set Supabase Anon Key
pnpm exec eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your_anon_key"

# Set Sentry DSN
pnpm exec eas secret:create --scope project --name SENTRY_DSN --value "your_sentry_dsn"
```

Create `apps/mobile/.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SENTRY_DSN=your_sentry_dsn
```

### Task 4.4: Set up GitHub Actions

Create `.github/workflows/mobile-preview.yml`:

```yaml
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
- [ ] EAS project created and linked
- [ ] Development build installs successfully
- [ ] Preview build triggers on PR
- [ ] Environment variables accessible in build

## 📱 Phase 5: Core Features Implementation (4-6 weeks)

### Feature 5.1: Home Feed & Product Listings (1 week)

#### Task 5.1.1: Create home screen

Create `apps/mobile/app/(tabs)/index.tsx`:

```typescript
import { View, FlatList, Text, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ProductCard } from '@repo/mobile-shared';
import { supabase } from '@repo/mobile-shared';

export default function HomeScreen() {
  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['products', 'feed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        select(`
          *,
          profiles: seller_id (
            username,
            avatar_url,
            rating
          ),
          product_images (
            image_url,
            display_order
          )
        `)
        .eq('status', 'active')
        .eq('is_sold', false)
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
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={() => router.push(`/product/${item.id}`)}
        />
      )}
      className="flex-1 bg-gray-50"
      contentContainerClassName="p-4"
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    />
  );
}
```

#### Task 5.1.2: Create ProductCard component

Create `packages/mobile-shared/src/components/ProductCard.tsx`:

```typescript
import { View, Text, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import type { Database } from '@repo/database';

type Product = Database['public']['Tables']['products']['Row'] & {
  profiles: {
    username: string | null;
    avatar_url: string | null;
    rating: number | null;
  };
  product_images: {
    image_url: string;
    display_order: number | null;
  }[];
};

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const mainImage = product.product_images?.[0]?.image_url;
  const price = new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'BGN',
  }).format(product.price);

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
    >
      {mainImage && (
        <Image
          source={{ uri: mainImage }}
          className="w-full h-48"
          resizeMode="cover"
        />
      )}
      <View className="p-4">
        <Text className="text-lg font-semibold mb-2" numberOfLines={2}>
          {product.title}
        </Text>
        <Text className="text-xl font-bold text-indigo-600">{price}</Text>
        {product.profiles.username && (
          <Text className="text-sm text-gray-500 mt-1">
            {product.profiles.username}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
```

### Feature 5.2: Product Detail Screen (1 week)

#### Task 5.2.1: Create product detail route

Create `apps/mobile/app/product/[id].tsx`:

```typescript
import { View, Text, ScrollView, Image, Pressable, Share } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@repo/mobile-shared';
import { useAuth } from '@repo/mobile-shared';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles: seller_id (
            username,
            avatar_url,
            rating,
            sales_count
          ),
          product_images (
            image_url,
            display_order
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async (isFavorited: boolean) => {
      if (!user || !id) return;
      
      if (isFavorited) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', id);
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, product_id: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['product', id]);
    },
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this item on Driplo: ${product?.title}`,
        url: `https://app.driplo.xyz/product/${id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading || !product) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  const price = new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'BGN',
  }).format(product.price);

  const isOwner = user?.id === product.seller_id;

  return (
    <>
      <Stack.Screen
        options={{
          title: product.title,
          headerRight: () => (
            <Pressable onPress={handleShare} className="p-2">
              {/* Share icon component */}
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-white">
        {/* Image Gallery */}
        <ScrollView horizontal pagingEnabled className="h-96">
          {product.product_images?.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image.image_url }}
              className="w-full h-96"
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        <View className="p-6">
          <Text className="text-2xl font-bold mb-2">{product.title}</Text>
          <Text className="text-3xl font-bold text-indigo-600 mb-4">{price}</Text>
          
          {/* Seller Info */}
          <View className="flex-row items-center mb-6">
            <Image
              source={{ uri: product.profiles.avatar_url || '' }}
              className="w-12 h-12 rounded-full mr-3"
            />
            <View>
              <Text className="font-semibold">{product.profiles.username}</Text>
              <Text className="text-sm text-gray-500">
                {product.profiles.rating?.toFixed(1)} ⭐ • {product.profiles.sales_count} sales
              </Text>
            </View>
          </View>

          <Text className="text-gray-700 mb-6">{product.description}</Text>

          {/* Action Buttons */}
          {isOwner ? (
            <Pressable
              onPress={() => router.push(`/sell/${id}/edit`)}
              className="bg-gray-600 rounded-lg py-4 mb-2"
            >
              <Text className="text-white text-center font-semibold text-lg">
                Edit Listing
              </Text>
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={() => router.push(`/messages/new?product=${id}`)}
                className="bg-indigo-600 rounded-lg py-4 mb-2"
              >
                <Text className="text-white text-center font-semibold text-lg">
                  Message Seller
                </Text>
              </Pressable>
              
              <Pressable
                onPress={() => favoriteMutation.mutate()}
                className="border border-indigo-600 rounded-lg py-4"
              >
                <Text className="text-indigo-600 text-center font-semibold text-lg">
                  {product.is_favorited ? 'Remove from Favorites' : 'Add to Favorites'}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}
```

### Feature 5.3: Sell Flow (1.5 weeks)

#### Task 5.3.1: Create sell screen with multi-step form

Create `apps/mobile/app/(tabs)/sell.tsx`:

```typescript
import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@repo/mobile-shared';
import { useAuth } from '@repo/mobile-shared';

type SellStep = 'photos' | 'details' | 'pricing' | 'review';

interface ListingData {
  title: string;
  description: string;
  price: string;
  category_id: string;
  condition: string;
  location: string;
  images: string[];
}

export default function SellScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState<SellStep>('photos');
  const [listingData, setListingData] = useState<ListingData>({
    title: '',
    description: '',
    price: '',
    category_id: '',
    condition: '',
    location: '',
    images: [],
  });

  const createListingMutation = useMutation({
    mutationFn: async (data: ListingData) => {
      if (!user) throw new Error('User not authenticated');
      
      // Upload images
      const uploadedImages = await Promise.all(
        data.images.map(async (uri, index) => {
          const filename = `${Date.now()}-${index}.jpg`;
          const response = await fetch(uri);
          const blob = await response.blob();
          
          const { data: uploadData, error } = await supabase.storage
            .from('product-images')
            .upload(filename, blob, {
              contentType: 'image/jpeg',
            });

          if (error) throw error;
          return uploadData.path;
        })
      );

      // Create product
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          seller_id: user.id,
          title: data.title,
          description: data.description,
          price: parseFloat(data.price),
          category_id: data.category_id,
          condition: data.condition as any,
          location: data.location,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Link images
      await supabase.from('product_images').insert(
        uploadedImages.map((path, index) => ({
          product_id: product.id,
          image_url: path,
          display_order: index,
        }))
      );

      return product;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries(['products']);
      router.replace(`/product/${product.id}`);
    },
  });

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      maxImages: 10,
    });

    if (!result.canceled) {
      setListingData(prev => ({
        ...prev,
        images: [...prev.images, ...result.assets.map(a => a.uri)],
      }));
    }
  };

  const removeImage = (index: number) => {
    setListingData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const nextStep = () => {
    const steps: SellStep[] = ['photos', 'details', 'pricing', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: SellStep[] = ['photos', 'details', 'pricing', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'photos':
        return (
          <View>
            <Text className="text-xl font-semibold mb-4">Add Photos</Text>
            
            <Pressable
              onPress={pickImages}
              className="bg-gray-100 rounded-lg h-48 justify-center items-center mb-4 border-2 border-dashed border-gray-300"
            >
              <Text className="text-gray-600">
                {listingData.images.length > 0 
                  ? `${listingData.images.length} photos added` 
                  : 'Tap to add photos'
                }
              </Text>
            </Pressable>

            {/* Image preview grid */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {listingData.images.map((uri, index) => (
                <View key={index} className="relative mr-2">
                  <Image
                    source={{ uri }}
                    className="w-24 h-24 rounded-lg"
                  />
                  <Pressable
                    onPress={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 justify-center items-center"
                  >
                    <Text className="text-white text-xs">×</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case 'details':
        return (
          <View>
            <Text className="text-xl font-semibold mb-4">Item Details</Text>
            
            {/* Form fields for title, description, category, condition, location */}
            {/* This would include TextInput components for each field */}
            <Text className="text-gray-600">Form fields go here</Text>
          </View>
        );

      case 'pricing':
        return (
          <View>
            <Text className="text-xl font-semibold mb-4">Set Price</Text>
            
            {/* Price input */}
            <Text className="text-gray-600">Price input goes here</Text>
          </View>
        );

      case 'review':
        return (
          <View>
            <Text className="text-xl font-semibold mb-4">Review Listing</Text>
            
            {/* Review all details before publishing */}
            <Text className="text-gray-600">Review screen goes here</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-6">List an Item</Text>

      {/* Progress indicator */}
      <View className="flex-row justify-between mb-8">
        {['photos', 'details', 'pricing', 'review'].map((step, index) => (
          <View
            key={step}
            className={`flex-1 h-1 mx-1 rounded-full ${
              currentStep === step || 
              (currentStep === 'details' && step === 'photos') ||
              (currentStep === 'pricing' && step !== 'review') ||
              currentStep === 'review'
                ? 'bg-indigo-600'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </View>

      {renderStep()}

      <View className="flex-row justify-between mt-8">
        <Pressable
          onPress={prevStep}
          disabled={currentStep === 'photos'}
          className={`flex-1 mr-2 rounded-lg py-4 ${
            currentStep === 'photos'
              ? 'bg-gray-300'
              : 'bg-gray-200'
          }`}
        >
          <Text className="text-center font-semibold">Previous</Text>
        </Pressable>

        {currentStep === 'review' ? (
          <Pressable
            onPress={() => createListingMutation.mutate(listingData)}
            disabled={createListingMutation.isLoading}
            className="flex-1 ml-2 bg-indigo-600 rounded-lg py-4"
          >
            <Text className="text-white text-center font-semibold">
              {createListingMutation.isLoading ? 'Publishing...' : 'Publish'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={nextStep}
            className="flex-1 ml-2 bg-indigo-600 rounded-lg py-4"
          >
            <Text className="text-white text-center font-semibold">Next</Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}
```

### Feature 5.4: Messages/Chat (1 week)

#### Task 5.4.1: Create conversations list

Create `apps/mobile/app/(tabs)/inbox.tsx`:

```typescript
import { View, FlatList, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@repo/mobile-shared';
import { useAuth } from '@repo/mobile-shared';

export default function InboxScreen() {
  const { user } = useAuth();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .rpc('get_user_conversations_secure')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/messages/${item.id}`)}
            className="p-4 border-b border-gray-200"
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="font-semibold flex-1">
                {(item.other_participant as any)?.username || 'Unknown User'}
              </Text>
              <Text className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(item.last_message_at), { addSuffix: true })}
              </Text>
            </View>
            <Text className="text-gray-600" numberOfLines={2}>
              {item.last_message_content}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-gray-500 text-center">
              No conversations yet. Start messaging sellers about items you're interested in!
            </Text>
          </View>
        }
      />
    </View>
  );
}
```

#### Task 5.4.2: Create chat screen

Create `apps/mobile/app/messages/[id].tsx`:

```typescript
import { View, FlatList, TextInput, Pressable, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useState } from 'react';
import { useChat } from '@repo/mobile-shared';
import { useAuth } from '@repo/mobile-shared';
import { MessageBubble } from '@repo/mobile-shared';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { messages, sendMessage, loading } = useChat(id);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Messages' }} />
      <View className="flex-1 bg-white">
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwn={item.sender_id === user?.id}
            />
          )}
          className="flex-1 p-4"
          contentContainerStyle={{ paddingBottom: 16 }}
        />

        <View className="border-t border-gray-200 p-4">
          <View className="flex-row items-center">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 mr-2"
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={handleSend}
              disabled={!input.trim()}
              className="bg-indigo-600 rounded-full w-10 h-10 justify-center items-center"
            >
              <Text className="text-white">→</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
}
```

**Validation:**
- [ ] Home feed loads products from Supabase
- [ ] Product detail displays all information
- [ ] Sell flow guides through all steps
- [ ] Chat messages send and receive in real-time
- [ ] All navigation works correctly

## 🧪 Phase 6: Testing & QA (1 week)

### Task 6.1: Set up unit tests

Install testing dependencies:

```bash
cd apps/mobile
pnpm add -D jest @testing-library/react-native @testing-library/jest-native
```

Create `apps/mobile/jest.config.js`:

```javascript
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@repo/(.*)$': '<rootDir>/../../packages/$1/src',
  },
};
```

Create `apps/mobile/jest.setup.js`:

```javascript
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(),
  maybeCompleteAuthSession: jest.fn(),
}));
```

### Task 6.2: Create example tests

Create `apps/mobile/src/components/__tests__/ProductCard.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProductCard } from '@repo/mobile-shared';

const mockProduct = {
  id: '1',
  title: 'Test Product',
  price: 100,
  description: 'Test description',
  seller_id: 'seller-1',
  category_id: 'cat-1',
  status: 'active',
  is_sold: false,
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
  profiles: {
    username: 'testuser',
    avatar_url: null,
    rating: 4.5,
  },
  product_images: [
    {
      image_url: 'https://example.com/image.jpg',
      display_order: 0,
    },
  ],
};

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ProductCard product={mockProduct} onPress={onPress} />
    );

    expect(getByText('Test Product')).toBeTruthy();
    expect(getByText('testuser')).toBeTruthy();
    expect(getByText('100,00 лв.')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ProductCard product={mockProduct} onPress={onPress} />
    );

    fireEvent.press(getByText('Test Product'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Task 6.3: Manual QA checklist

Create `apps/mobile/QA_CHECKLIST.md`:

```markdown
# Mobile App QA Checklist

## Authentication
- [ ] Sign in with Apple works
- [ ] Sign in with Google works
- [ ] Magic link authentication works
- [ ] User session persists across app restart
- [ ] Sign out works correctly

## Product Discovery
- [ ] Home feed loads without errors
- [ ] Pull-to-refresh updates feed
- [ ] Search returns relevant results
- [ ] Category filters work
- [ ] Product detail loads correctly
- [ ] Image gallery functions properly
- [ ] Add to favorites works

## Selling
- [ ] Can select multiple photos
- [ ] Image upload completes successfully
- [ ] Form validation works
- [ ] Multi-step flow completes
- [ ] New listing appears in feed

## Messaging
- [ ] Can start new conversation
- [ ] Messages send and receive
- [ ] Real-time updates work
- [ ] Push notifications arrive
- [ ] Conversation list updates

## General
- [ ] App orientation works
- [ ] Dark mode applies correctly
- [ ] Text scaling works
- [ ] Back navigation works
- [ ] Deep linking functions
- [ ] Performance is acceptable
- [ ] No memory leaks
- [ ] Error handling works
```

**Validation:**
- [ ] Unit tests pass
- [ ] Manual QA checklist completed
- [ ] Accessibility testing done
- [ ] Performance benchmarks met

## 🚀 Phase 7: Production Release (1 week)

### Task 7.1: Build production binaries

```bash
cd apps/mobile

# iOS production build
pnpm exec eas build --profile production --platform ios

# Android production build
pnpm exec eas build --profile production --platform android
```

### Task 7.2: Submit to app stores

```bash
# Submit to App Store
pnpm exec eas submit --platform ios

# Submit to Google Play
pnpm exec eas submit --platform android
```

### Task 7.3: Configure OTA updates

```bash
# Publish update to production channel
pnpm exec eas update --branch production --message "Initial release"
```

### Task 7.4: Set up monitoring

Add Sentry to the app:

```bash
pnpm add @sentry/react-native
pnpm exec sentry-wizard -i react-native -p ios android
```

Initialize Sentry in `apps/mobile/app/_layout.tsx`:

```typescript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  debug: __DEV__,
});
```

**Validation:**
- [ ] Production builds signed correctly
- [ ] App Store submission approved
- [ ] Google Play submission approved
- [ ] Sentry error tracking active
- [ ] OTA updates configured
- [ ] Analytics tracking events

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

## 🔄 Post-Launch Maintenance

### Weekly Tasks
- Monitor crash reports and fix critical issues
- Review performance metrics
- Update dependencies as needed
- Respond to user feedback

### Monthly Tasks
- Publish OTA updates with bug fixes
- Analyze user behavior data
- Plan feature improvements
- Update app store metadata

### Quarterly Tasks
- Major feature releases
- Platform compatibility updates
- Security audits
- Performance optimizations

---

**Next Steps:**
1. Begin implementation with Phase 0
2. Set up development environment
3. Follow each phase sequentially
4. Test thoroughly before release
5. Monitor post-launch metrics closely

**Prepared by:** Kilo Code (Architect Mode)  
**Last Updated:** October 13, 2025