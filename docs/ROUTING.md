# ROUTING - SvelteKit Best Practices & Rules

**Reference**: https://svelte.dev/docs/kit/routing

## STRICT RULES

### 1. File-Based Routing
```
src/routes/
├── +page.svelte         # /
├── about/+page.svelte   # /about
├── blog/[slug]/         # /blog/:slug (dynamic)
│   ├── +page.svelte
│   └── +page.ts        # Load function
└── (group)/            # No URL impact
    └── admin/          # /admin (grouped)
```

### 2. Route Files Priority
```
+page.svelte      # UI component (REQUIRED)
+page.ts          # Universal load function
+page.server.ts   # Server-only load function
+layout.svelte    # Shared layout
+layout.ts        # Layout load function
+error.svelte     # Error boundary
+server.ts        # API endpoint
```

**NEVER mix +page.ts and +page.server.ts in same route**

### 3. Dynamic Routes Rules
```
[param]           # Required parameter
[[param]]         # Optional parameter
[...rest]         # Rest parameters (catch-all)
[[...rest]]       # Optional catch-all
```

### 4. Route Groups (No URL Impact)
```
(auth)/           # Group auth pages
(marketing)/      # Group marketing pages
(protected)/      # Group protected pages
```

### 5. Layout Rules
- Layouts nest automatically
- Reset with +layout@.svelte
- Data flows down via `$page.data`

### 6. Navigation Rules
```javascript
// ✅ CORRECT
import { goto } from '$app/navigation';
goto('/path');

// ❌ WRONG
window.location.href = '/path';
```

### 7. Link Rules
```svelte
<!-- ✅ CORRECT -->
<a href="/about">About</a>
<a href="/blog/{post.slug}">Read</a>

<!-- ❌ WRONG -->
<a href="#">Click</a>
<a onclick={navigate}>Nav</a>
```

## CURRENT ROUTES AUDIT

### ✅ Good Patterns
- `(auth)/` - Groups login/signup
- `(protected)/` - Groups authenticated routes
- `product/[id]/` - Dynamic product pages

### ❌ Issues to Fix
- Missing +error.svelte in root
- Some routes missing TypeScript
- Inconsistent load function usage

## COMMANDS TO FIX

```bash
# Create missing error page
touch src/routes/+error.svelte

# Find routes without TypeScript
find src/routes -name "*.js" -type f

# Check for href="#" violations
grep -r 'href="#"' src/routes
```