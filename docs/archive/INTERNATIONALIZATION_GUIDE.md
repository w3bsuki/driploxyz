# Driplo Internationalization (i18n) - BULLETPROOF Implementation Guide

## ⚠️ CRITICAL: Why Previous Attempts Failed

### Common Failure Points:
1. **Build Order Chaos**: Trying to import generated files before they exist
2. **Missing Config Files**: No TypeScript config for i18n package
3. **Overcomplexity**: Implementing routing before basic translations work
4. **No Verification**: Not testing each step before proceeding
5. **Import Path Issues**: Wrong file extensions and paths

## ✅ This Guide's Approach: START SIMPLE, VERIFY, THEN SCALE

We'll implement i18n in **THREE PHASES**:
1. **Phase 1**: Get basic translations working (no routing, just messages)
2. **Phase 2**: Add language switching (simple, no URL routing)
3. **Phase 3**: Add URL-based routing (only after basics work)

---

## PHASE 1: BASIC TRANSLATIONS (Get This Working FIRST!)

### Step 1: Create the i18n Package Structure

```bash
# From project root
mkdir -p packages/i18n/messages
mkdir -p packages/i18n/src
mkdir -p packages/i18n/lib
```

### Step 2: Create package.json with CORRECT Configuration

**packages/i18n/package.json**
```json
{
  "name": "@repo/i18n",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "build": "pnpm run compile && pnpm run types",
    "compile": "paraglide-js compile --project ./project.inlang --outdir ./lib/paraglide",
    "types": "tsc",
    "dev": "paraglide-js compile --project ./project.inlang --outdir ./lib/paraglide --watch",
    "clean": "rm -rf lib dist"
  },
  "main": "./lib/index.js",
  "types": "./lib/index.d.ts",
  "exports": {
    ".": {
      "types": "./lib/index.d.ts",
      "import": "./lib/index.js",
      "default": "./lib/index.js"
    }
  },
  "files": [
    "lib",
    "messages"
  ],
  "dependencies": {
    "@inlang/paraglide-js": "1.11.2"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.8.2"
  }
}
```

### Step 3: Create TypeScript Configuration

**packages/i18n/tsconfig.json**
```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./lib",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "module": "ESNext",
    "target": "ES2022",
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "lib", "dist"]
}
```

### Step 4: Create Inlang Configuration

**packages/i18n/project.inlang/settings.json**
```json
{
  "$schema": "https://inlang.com/schema/project-settings",
  "sourceLanguageTag": "en",
  "languageTags": ["en", "bg", "ru", "ua"],
  "modules": [
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-empty-pattern@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-missing-translation@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-without-source@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/message-lint-rule-valid-js-identifier@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@latest/dist/index.js",
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-m-function-matcher@latest/dist/index.js"
  ],
  "plugin.inlang.messageFormat": {
    "pathPattern": "./messages/{languageTag}.json"
  }
}
```

### Step 5: Create MINIMAL Test Messages (5 keys only for testing!)

**packages/i18n/messages/en.json**
```json
{
  "hello": "Hello",
  "welcome": "Welcome to Driplo",
  "loading": "Loading...",
  "price": "Price",
  "test": "English works!"
}
```

**packages/i18n/messages/bg.json**
```json
{
  "hello": "Здравей",
  "welcome": "Добре дошли в Driplo",
  "loading": "Зареждане...",
  "price": "Цена",
  "test": "Български работи!"
}
```

**packages/i18n/messages/ru.json**
```json
{
  "hello": "Привет",
  "welcome": "Добро пожаловать в Driplo",
  "loading": "Загрузка...",
  "price": "Цена",
  "test": "Русский работает!"
}
```

**packages/i18n/messages/ua.json**
```json
{
  "hello": "Привіт",
  "welcome": "Ласкаво просимо до Driplo",
  "loading": "Завантаження...",
  "price": "Ціна",
  "test": "Українська працює!"
}
```

### Step 6: Create the Main Index File

**packages/i18n/src/index.ts**
```typescript
// Import generated files (will exist after build)
import * as messages from '../lib/paraglide/messages.js';
import * as runtime from '../lib/paraglide/runtime.js';

// Re-export everything
export const m = messages;
export const {
  setLanguageTag,
  languageTag,
  sourceLanguageTag,
  availableLanguageTags,
  isAvailableLanguageTag,
  onSetLanguageTag
} = runtime;

// Type definitions
export type LanguageTag = 'en' | 'bg' | 'ru' | 'ua';

// Helper constants
export const languageNames: Record<LanguageTag, string> = {
  en: 'English',
  bg: 'Български',
  ru: 'Русский',
  ua: 'Українська'
};

// Simple language detection (for later use)
export function detectLanguage(acceptLanguage?: string): LanguageTag {
  if (!acceptLanguage) return 'en';
  
  const langs = acceptLanguage.toLowerCase();
  if (langs.includes('bg')) return 'bg';
  if (langs.includes('ru')) return 'ru';
  if (langs.includes('uk') || langs.includes('ua')) return 'ua';
  return 'en';
}
```

### Step 7: Add to .gitignore

**packages/i18n/.gitignore**
```
lib/
dist/
node_modules/
```

### Step 8: Build the i18n Package

```bash
cd packages/i18n
pnpm install
pnpm build
```

**VERIFY**: Check that `packages/i18n/lib/` directory was created with:
- `index.js`
- `index.d.ts`
- `paraglide/messages.js`
- `paraglide/runtime.js`

If these files don't exist, STOP and debug before continuing!

### Step 9: Add i18n to Web App

**apps/web/package.json** (add to dependencies)
```json
"dependencies": {
  "@repo/i18n": "workspace:*",
  // ... other deps
}
```

```bash
cd apps/web
pnpm install
```

### Step 10: Create a Test Component

**apps/web/src/routes/+page.svelte**
```svelte
<script lang="ts">
  import { m, languageTag, setLanguageTag, availableLanguageTags } from '@repo/i18n';
  
  // Set initial language
  setLanguageTag('en');
  
  function switchLanguage(lang: string) {
    setLanguageTag(lang as any);
  }
</script>

<div class="p-8">
  <h1 class="text-2xl font-bold mb-4">{m.welcome()}</h1>
  <p class="mb-4">{m.test()}</p>
  <p class="mb-4">Current language: {languageTag()}</p>
  
  <div class="flex gap-2">
    {#each availableLanguageTags as lang}
      <button 
        onclick={() => switchLanguage(lang)}
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {lang}
      </button>
    {/each}
  </div>
</div>
```

### Step 11: Test It!

```bash
# From root
pnpm dev --filter web
```

**VERIFY**:
1. Page loads without errors
2. You see "Welcome to Driplo"
3. Clicking language buttons changes the text
4. Console has no errors

**If this doesn't work, DO NOT PROCEED! Debug first.**

---

## PHASE 2: Add UI Components Support (Only After Phase 1 Works!)

### Step 12: Update UI Package to Use i18n

**packages/ui/package.json** (add to dependencies, not peerDependencies)
```json
"dependencies": {
  "@repo/i18n": "workspace:*",
  // ... other deps
}
```

### Step 13: Update a UI Component

**packages/ui/src/ProductCard.svelte**
```svelte
<script lang="ts">
  import { m } from '@repo/i18n';
  import type { Product } from './types.js';
  
  interface Props {
    product: Product;
    onSelect?: (product: Product) => void;
  }
  
  let { product, onSelect }: Props = $props();
</script>

<div class="border rounded-lg p-4">
  <h3>{product.title}</h3>
  <p>{m.price()}: ${product.price}</p>
  <!-- rest of component -->
</div>
```

### Step 14: Add More Translations Gradually

Once basic setup works, add more translations to your JSON files:

**packages/i18n/messages/en.json**
```json
{
  "hello": "Hello",
  "welcome": "Welcome to Driplo",
  "loading": "Loading...",
  "price": "Price",
  "test": "English works!",
  
  "nav_home": "Home",
  "nav_search": "Search",
  "nav_profile": "Profile",
  
  "auth_login": "Log In",
  "auth_signup": "Sign Up",
  "auth_logout": "Log Out",
  
  "product_add_to_cart": "Add to Cart",
  "product_size": "Size",
  "product_condition": "Condition"
}
```

Remember to rebuild after adding translations:
```bash
cd packages/i18n && pnpm build
```

---

## PHASE 3: URL-Based Routing (Only After Phases 1-2 Work!)

### Step 15: Create Language Persistence Store

**apps/web/src/lib/stores/language.ts**
```typescript
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { setLanguageTag, type LanguageTag } from '@repo/i18n';

function createLanguageStore() {
  const stored = browser ? localStorage.getItem('driplo-lang') : null;
  const initial = (stored as LanguageTag) || 'en';
  
  const { subscribe, set } = writable<LanguageTag>(initial);
  
  return {
    subscribe,
    set: (lang: LanguageTag) => {
      setLanguageTag(lang);
      if (browser) {
        localStorage.setItem('driplo-lang', lang);
      }
      set(lang);
    }
  };
}

export const currentLanguage = createLanguageStore();
```

### Step 16: Initialize Language in Root Layout

**apps/web/src/routes/+layout.svelte**
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { currentLanguage } from '$lib/stores/language';
  import { setLanguageTag } from '@repo/i18n';
  
  interface Props {
    children?: import('svelte').Snippet;
  }
  
  let { children }: Props = $props();
  
  onMount(() => {
    // Set language from store
    const unsubscribe = currentLanguage.subscribe(lang => {
      setLanguageTag(lang);
    });
    
    return unsubscribe;
  });
</script>

{#if children}
  {@render children()}
{/if}
```

### Step 17: Create Language Switcher Component

**packages/ui/src/LanguageSwitcher.svelte**
```svelte
<script lang="ts">
  import { languageTag, setLanguageTag, availableLanguageTags, languageNames, type LanguageTag } from '@repo/i18n';
  
  interface Props {
    onLanguageChange?: (lang: LanguageTag) => void;
  }
  
  let { onLanguageChange }: Props = $props();
  
  function handleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    const newLang = target.value as LanguageTag;
    setLanguageTag(newLang);
    onLanguageChange?.(newLang);
  }
</script>

<select 
  value={languageTag()} 
  onchange={handleChange}
  class="px-3 py-1 border rounded"
>
  {#each availableLanguageTags as lang}
    <option value={lang}>{languageNames[lang]}</option>
  {/each}
</select>
```

---

## Build Commands

```bash
# Build i18n package (REQUIRED FIRST)
cd packages/i18n && pnpm build

# Then build everything else
pnpm build

# Development (after initial i18n build)
pnpm dev
```

---

## Common Issues & Solutions

### Issue: "Cannot find module '@repo/i18n'"
**Solution**: Build the i18n package first
```bash
cd packages/i18n && pnpm build
```

### Issue: "Cannot find module '../lib/paraglide/messages.js'"
**Solution**: The paraglide files haven't been generated
```bash
cd packages/i18n
pnpm run compile
pnpm run types
```

### Issue: Translations not updating
**Solution**: Rebuild the i18n package
```bash
cd packages/i18n && pnpm build
# Then restart dev server
```

### Issue: TypeScript errors in i18n package
**Solution**: Make sure tsconfig.json is correct and rebuild
```bash
cd packages/i18n
pnpm run clean
pnpm build
```

---

## Testing Checklist

### Phase 1 (Must Pass Before Continuing)
- [ ] i18n package builds without errors
- [ ] lib/paraglide directory is created with messages.js and runtime.js
- [ ] Basic test page shows translations
- [ ] Language switching works in test component
- [ ] No console errors

### Phase 2
- [ ] UI components can import and use translations
- [ ] Multiple components using translations work
- [ ] Build completes without errors

### Phase 3
- [ ] Language preference persists on refresh
- [ ] Language switcher component works
- [ ] All text is translated

---

## Why This Guide Works

1. **Starts Simple**: Just get basic translations working first
2. **Verifies Each Step**: Clear checkpoints before proceeding
3. **Proper Build Config**: TypeScript and Paraglide configured correctly
4. **Correct File Paths**: Uses lib/ directory for compiled output
5. **No Overcomplexity**: Avoids routing until basics work
6. **Clear Troubleshooting**: Solutions for common problems

---

## Full Translation Keys Reference

Once the basic setup works, here are all the keys you should implement:

```json
{
  // Navigation
  "nav_home": "Home",
  "nav_search": "Search",
  "nav_profile": "Profile",
  "nav_messages": "Messages",
  "nav_sell": "Sell",
  "nav_favorites": "Favorites",
  "nav_cart": "Cart",
  
  // Authentication
  "auth_login": "Log In",
  "auth_signup": "Sign Up",
  "auth_logout": "Log Out",
  "auth_email": "Email",
  "auth_password": "Password",
  "auth_forgot_password": "Forgot Password?",
  "auth_remember_me": "Remember me",
  "auth_or_continue_with": "Or continue with",
  
  // Products
  "product_price": "Price",
  "product_size": "Size",
  "product_brand": "Brand",
  "product_condition": "Condition",
  "product_color": "Color",
  "product_add_to_cart": "Add to Cart",
  "product_buy_now": "Buy Now",
  "product_make_offer": "Make an Offer",
  "product_sold": "Sold",
  "product_available": "Available",
  "product_seller": "Seller",
  "product_description": "Description",
  "product_shipping": "Shipping",
  "product_returns": "Returns",
  
  // Common
  "common_loading": "Loading...",
  "common_error": "Something went wrong",
  "common_retry": "Try Again",
  "common_save": "Save",
  "common_cancel": "Cancel",
  "common_delete": "Delete",
  "common_edit": "Edit",
  "common_search": "Search",
  "common_filter": "Filter",
  "common_sort": "Sort",
  "common_close": "Close",
  "common_back": "Back",
  "common_next": "Next",
  "common_previous": "Previous",
  "common_confirm": "Confirm",
  
  // Messages/Chat
  "chat_send": "Send",
  "chat_type_message": "Type a message...",
  "chat_online": "Online",
  "chat_offline": "Offline",
  "chat_typing": "Typing...",
  
  // User/Profile
  "profile_settings": "Settings",
  "profile_orders": "Orders",
  "profile_sales": "Sales",
  "profile_reviews": "Reviews",
  "profile_followers": "Followers",
  "profile_following": "Following",
  "profile_edit": "Edit Profile",
  
  // Marketplace
  "marketplace_featured": "Featured Items",
  "marketplace_trending": "Trending Now",
  "marketplace_new": "New Arrivals",
  "marketplace_categories": "Categories",
  "marketplace_brands": "Brands",
  "marketplace_deals": "Deals"
}
```

Remember: Add these gradually AFTER the basic setup works!