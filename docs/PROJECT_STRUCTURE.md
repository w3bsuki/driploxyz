# PROJECT STRUCTURE - SvelteKit Best Practices & Rules

**Reference**: https://svelte.dev/docs/kit/project-structure

## STRICT RULES

### 1. Required Files (NEVER DELETE)
```
├── package.json         # Dependencies & scripts
├── svelte.config.js     # SvelteKit configuration
├── vite.config.js       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── src/
    ├── app.html         # HTML template
    ├── app.d.ts         # TypeScript app definitions
    └── routes/          # Application routes
```

### 2. app.html Rules
```html
<!-- MUST HAVE -->
%sveltekit.lang%        <!-- In <html lang=""> -->
%sveltekit.head%        <!-- Before </head> -->
%sveltekit.body%        <!-- Inside a <div> wrapper -->
%sveltekit.assets%      <!-- For static asset paths -->
%sveltekit.nonce%       <!-- For CSP if needed -->

<!-- NEVER DO -->
❌ Console.log in production
❌ Inline styles (except critical CSS)
❌ External scripts without defer/async
❌ More than 2-3 preconnect hints
```

### 3. src/lib Organization Rules
```
src/lib/
├── components/          # Shared components (USE @repo/ui INSTEAD!)
├── server/             # Server-only code
│   ├── db.ts          # Database connections
│   └── secrets.ts     # API keys (NEVER client-accessible)
├── stores/             # Global Svelte stores
├── utils/              # Shared utilities
└── types/              # TypeScript types
```

**Import Rules:**
- ✅ `import { util } from '$lib/utils'`
- ❌ `import { secret } from '$lib/server/secrets'` (in client code)

### 4. Static Assets Rules
```
static/
├── favicon.png         # REQUIRED
├── robots.txt         # REQUIRED for SEO
├── manifest.json      # PWA manifest
└── [assets]/          # Images, fonts (< 1MB each)
```

**Rules:**
- Files served AS-IS from root URL
- NO JavaScript processing
- Use for: favicons, robots.txt, sitemap.xml
- NOT for: Large images (use CDN), Dynamic content

### 5. Routes Structure Rules
```
src/routes/
├── +page.svelte        # Homepage
├── +layout.svelte      # Root layout
├── +error.svelte       # Error page
├── (group)/            # Route groups (no URL impact)
├── [param]/            # Dynamic segments
└── api/                # API endpoints
    └── +server.ts      # GET, POST, etc.
```

### 6. Service Worker Rules
- Use ONLY `src/service-worker.js` (NOT .ts)
- Delete if not using offline features
- Must register in app.html if using

## CURRENT VIOLATIONS TO FIX

### 1. ❌ app.html has console.logs
```javascript
// REMOVE THESE (lines 39, 47)
console.log('[LCP]', ...);
console.log('[FID]', ...);
```

### 2. ❌ Duplicate service workers
```bash
# DELETE ONE:
rm src/service-worker.ts  # Keep .js version
```

### 3. ❌ Unused static assets
```bash
# CHECK USAGE:
/static/avatars/   # If unused, DELETE
/static/sounds/    # If unused, DELETE
```

### 4. ❌ Wrong component location
Components should be in `packages/ui`, NOT `src/lib/components`

## CORRECT STRUCTURE

```
apps/web/
├── src/
│   ├── app.html           # Minimal HTML template
│   ├── app.d.ts           # TypeScript definitions
│   ├── app.css            # Global styles ONLY
│   ├── hooks.server.ts    # Server hooks
│   ├── hooks.client.ts    # Client hooks
│   ├── lib/
│   │   ├── server/        # Server-only modules
│   │   ├── stores/        # App-specific stores
│   │   └── utils/         # App-specific utils
│   └── routes/
│       ├── +layout.svelte
│       ├── +page.svelte
│       └── [routes]/
├── static/
│   ├── favicon.png
│   ├── robots.txt
│   └── manifest.json
└── tests/
```

## COMMANDS TO FIX

```bash
# 1. Clean app.html
sed -i '/console.log/d' src/app.html

# 2. Remove duplicate service worker
rm src/service-worker.ts

# 3. Check for unused assets
find static -type f -exec grep -r {} src \; 

# 4. Move components to packages/ui
mv src/lib/components/* ../../packages/ui/src/
```

## VALIDATION CHECKLIST

- [ ] app.html < 100 lines
- [ ] No console.logs in app.html
- [ ] Only ONE service-worker file
- [ ] Static folder < 5MB total
- [ ] All components in packages/ui
- [ ] Server code in src/lib/server
- [ ] No secrets in client code