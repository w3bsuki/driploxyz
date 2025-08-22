# DRIPLO LEAN PRODUCTION PLAN
> **ZERO BLOAT - MAXIMUM IMPACT** — Production ready in 48 hours

## 🎯 REALITY CHECK

**PROBLEM**: 50+ HTTP requests, 5+ second loads, broken search, test data pollution
**SOLUTION**: Aggressive cleanup, remove bloat, minimal code, maximum performance

**GOAL**: From broken → production ready in 2 days with ZERO over-engineering

---

## 🔥 PHASE 1: EMERGENCY CLEANUP (24 hours)
> **GOAL**: Fix performance disasters, remove bloat, clean data

### 1.1 HTTP REQUEST MASSACRE (4 hours)

**TARGET**: 50+ requests → 8 requests

```bash
# 1. Remove dist bloat causing 404s
rm -rf packages/ui/dist
echo "dist/" >> packages/ui/.gitignore

# 2. Bundle everything aggressively  
# Edit apps/web/vite.config.ts
```

```javascript
// apps/web/vite.config.ts - AGGRESSIVE bundling
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: () => 'app', // EVERYTHING in one chunk
        chunkFileNames: '[hash].js',
        assetFileNames: '[hash].[ext]'
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true }
    }
  }
});
```

### 1.2 FONT BLOAT ELIMINATION (1 hour)

```html
<!-- apps/web/src/app.html - REMOVE Google Fonts bloat -->
<head>
  <!-- DELETE: All Google Fonts imports -->
  <!-- USE: System fonts only -->
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
```

### 1.3 CSS BLOAT REMOVAL (2 hours)

```bash
# Remove TailwindCSS duplication - keep only web app version
rm packages/ui/tailwind.config.js
```

```javascript
// apps/web/tailwind.config.js - MINIMAL config
export default {
  content: ['./src/**/*.{html,js,svelte,ts}', '../packages/ui/src/**/*.svelte'],
  theme: { extend: {} }, // NO custom bloat
  plugins: [] // NO plugins
};
```

### 1.4 SVELTE 5 CRITICAL FIX (1 hour)

```javascript
// Add runes: true to both configs
// apps/web/svelte.config.js + packages/ui/svelte.config.js
export default {
  compilerOptions: { runes: true },
  // Remove all other bloat
};
```

### 1.5 DATA POLLUTION CLEANUP (4 hours)

```sql
-- Execute via Supabase dashboard - AGGRESSIVE cleanup
DELETE FROM products WHERE title IN ('eban login', 'Тениска за тсрикати', '123', '777');
DELETE FROM products WHERE price > 1000 OR price < 1;
DELETE FROM products WHERE description IS NULL OR description = '';

-- Keep only 20 REAL products for testing
DELETE FROM products WHERE id NOT IN (
  SELECT id FROM products 
  WHERE title NOT LIKE '%test%' 
  AND images IS NOT NULL 
  ORDER BY created_at DESC 
  LIMIT 20
);
```

### 1.6 IMAGE OPTIMIZATION (2 hours)

```typescript
// apps/web/src/lib/components/Image.svelte - MINIMAL
<script lang="ts">
  interface Props { src: string; alt: string; }
  let { src, alt }: Props = $props();
</script>

<img {src} {alt} loading="lazy" decoding="async" />
```

### 1.7 DEPENDENCY AUDIT (2 hours)

```bash
# Remove unused dependencies
pnpm remove date-fns zod lucide-svelte # Keep only essentials
pnpm remove @tailwindcss/typography @tailwindcss/forms # Remove plugins

# Keep ONLY: svelte, sveltekit, supabase, stripe
```

---

## ⚡ PHASE 2: CORE FUNCTIONALITY (24 hours)
> **GOAL**: Make search/auth/nav actually work with minimal code

### 2.1 SEARCH FIX (4 hours)

```typescript
// apps/web/src/routes/search/+page.server.ts - MINIMAL
export async function load({ url, locals }) {
  const q = url.searchParams.get('q');
  if (!q) return { products: [] };

  const { data } = await locals.supabase
    .from('products')
    .select('id, title, price, images')
    .ilike('title', `%${q}%`)
    .limit(20);

  return { products: data || [] };
}
```

### 2.2 AUTH SIMPLIFICATION (4 hours)

```typescript
// Keep existing auth, just remove bloat from hooks.server.ts
// Remove: Sentry, i18n complexity, environment validation
// Keep: Auth only
```

### 2.3 NAVIGATION CLEANUP (2 hours)

```svelte
<!-- apps/web/src/lib/components/Header.svelte - MINIMAL -->
<header class="bg-white border-b p-4">
  <div class="flex items-center justify-between max-w-6xl mx-auto">
    <a href="/" class="font-bold text-xl">Driplo</a>
    
    <form action="/search" class="flex-1 mx-8">
      <input name="q" type="search" placeholder="Search..." 
             class="w-full p-2 border rounded" />
    </form>
    
    <div class="space-x-4">
      <a href="/login">Login</a>
      <a href="/sell" class="bg-blue-600 text-white px-4 py-2 rounded">Sell</a>
    </div>
  </div>
</header>
```

### 2.4 PRODUCT GRID MINIMAL (4 hours)

```svelte
<!-- apps/web/src/lib/components/ProductGrid.svelte -->
<script lang="ts">
  interface Props { products: any[]; }
  let { products }: Props = $props();
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
  {#each products as product}
    <a href="/product/{product.id}" class="border rounded p-4 hover:shadow">
      <img src={product.images?.[0]} alt={product.title} class="w-full h-48 object-cover" />
      <h3 class="font-medium mt-2">{product.title}</h3>
      <p class="text-lg font-bold">{product.price}лв</p>
    </a>
  {/each}
</div>
```

### 2.5 MOBILE BASIC (4 hours)

```css
/* apps/web/src/app.css - MINIMAL responsive */
@media (max-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
  .p-4 { padding: 1rem; }
  .mx-8 { margin: 0 1rem; }
}
```

### 2.6 REMOVE BLOAT FEATURES (6 hours)

```bash
# Delete unnecessary files/features
rm -rf apps/web/src/lib/components/ui/ # Remove shadcn bloat
rm -rf apps/web/src/routes/admin/ # Remove admin if exists
rm -rf apps/web/src/lib/stores/ # Keep state in components only

# Remove i18n complexity
rm -rf packages/i18n/
# Update imports to remove i18n usage
```

---

## 🎯 SUCCESS METRICS

**BEFORE**: 50+ requests, 5+ seconds, broken search
**AFTER**: <10 requests, <2 seconds, working search

### Performance Targets
- **HTTP Requests**: <10 (from 50+)
- **Load Time**: <2s (from 5s+)
- **Bundle Size**: <500KB total
- **Dependencies**: <20 packages

### Functionality Targets  
- **Search**: Works with real results
- **Auth**: Login/signup functional
- **Products**: 20 real items displayed
- **Mobile**: Usable on phone

---

## 📋 EXECUTION CHECKLIST

### Day 1: Performance + Cleanup
- [ ] Remove packages/ui/dist
- [ ] Add runes: true to configs
- [ ] Bundle everything into single chunk
- [ ] Remove Google Fonts
- [ ] Clean database (keep 20 products)
- [ ] Remove unused dependencies
- [ ] Test build: pnpm build

### Day 2: Core Features
- [ ] Fix search functionality  
- [ ] Simplify navigation
- [ ] Create minimal product grid
- [ ] Basic mobile responsiveness
- [ ] Remove bloat features/files
- [ ] Final test: search + auth + mobile

---

## 🚀 PHASE 1 EXECUTION PROMPT

```bash
# COPY THIS TO NEW TERMINAL - EXECUTE IMMEDIATELY

# 1. Clean dist bloat
rm -rf packages/ui/dist && echo "dist/" >> packages/ui/.gitignore

# 2. Add Svelte 5 runes config
cat > apps/web/svelte.config.js << 'EOF'
import adapter from '@sveltejs/adapter-auto';
export default {
  kit: { adapter: adapter() },
  compilerOptions: { runes: true }
};
EOF

cp apps/web/svelte.config.js packages/ui/svelte.config.js

# 3. Aggressive bundle config
cat > apps/web/vite.config.ts << 'EOF'
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: () => 'app',
        chunkFileNames: '[hash].js',
        assetFileNames: '[hash].[ext]'
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true, drop_debugger: true }
    }
  }
});
EOF

# 4. Remove font bloat
sed -i '/fonts\.googleapis\.com/d' apps/web/src/app.html

# 5. Test immediately
pnpm build && echo "✅ PHASE 1 COMPLETE - Check browser network tab"
```

---

## 💡 ANTI-PATTERN RULES

**NEVER ADD:**
- More dependencies
- Complex state management  
- Advanced animations
- Multiple CSS frameworks
- Micro-optimizations
- Over-abstracted components

**ALWAYS PREFER:**
- Inline styles over CSS files
- System fonts over web fonts
- Single chunks over code splitting
- Direct DOM over complex state
- Hardcoded values over configuration
- Delete over refactor

---

**RESULT**: Production-ready in 48 hours with ZERO bloat and maximum performance.