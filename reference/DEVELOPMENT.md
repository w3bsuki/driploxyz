# 🛠 DRIPLO DEVELOPMENT GUIDE

## ⚡ **Quick Start**

### **Prerequisites**
```bash
# Required
Node.js 18+ (LTS recommended)
pnpm 8+ (npm install -g pnpm)
Git 2.40+

# Optional but recommended
VS Code with Svelte extension
Playwright for E2E testing
```

### **Initial Setup**
```bash
# Clone repository
git clone <repository-url>
cd driplo-turbo-1

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Add your Supabase and Stripe keys

# Database setup
pnpm db:push        # Push schema to Supabase
pnpm db:types       # Generate TypeScript types

# Start development (mobile-first at 375px)
pnpm dev --filter web
```

### **Environment Variables**
```env
# Supabase (Required)
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Stripe (Required for payments)
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Optional
PUBLIC_SITE_URL=http://localhost:5173
RESEND_API_KEY=re_xxx
```

## 📱 **Development Workflow**

### **Core Commands**
```bash
# Development
pnpm dev              # Start all packages
pnpm dev:web         # Web app only (recommended)
pnpm dev:ui          # Component library

# Quality Checks (MUST PASS)
pnpm check-types     # TypeScript validation
pnpm lint           # ESLint checks  
pnpm format         # Prettier formatting
svelte-check        # Svelte compiler checks

# Building
pnpm build          # Production build all
pnpm build:web      # Web app only
pnpm preview        # Preview production build

# Testing
pnpm test           # Run all tests
pnpm test:unit      # Unit tests only
pnpm test:e2e       # Playwright E2E tests
```

### **Mobile-First Testing**
1. **Always start at 375x667 viewport**
2. **Test touch interactions** (44px targets)
3. **Check iOS safe areas** (notch handling)
4. **Verify Android navigation** (back button)
5. **Test offline scenarios** (PWA cache)

### **Git Workflow**
```bash
# Feature branch
git checkout -b feature/mobile-checkout

# Commit standards
git commit -m "feat: add mobile-optimized checkout flow"
# Types: feat|fix|docs|style|refactor|perf|test

# Before pushing
pnpm check-types    # Must be 0 errors
pnpm lint          # Must pass
pnpm build:web     # Must succeed

# Create PR
gh pr create --title "Mobile checkout optimization"
```

## 🏗 **Code Standards**

### **TypeScript Guidelines**
```typescript
// ✅ GOOD: Explicit types, mobile-first
interface MobileProductCard {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  onClick?: () => void;
}

// ❌ BAD: Any types, unclear naming
interface Card {
  data: any;
  handler: Function;
}
```

### **Svelte 5 Patterns**
```svelte
<!-- ✅ GOOD: $state runes, typed props -->
<script lang="ts">
  interface Props {
    product: Product;
    size?: 'sm' | 'md' | 'lg';
  }
  
  let { product, size = 'md' }: Props = $props();
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<!-- ❌ BAD: Old syntax -->
<script lang="ts">
  export let product;
  let count = 0;
  $: doubled = count * 2;
</script>
```

### **Component Structure**
```
src/lib/components/ProductCard.svelte
├── Props interface definition
├── State declarations ($state)
├── Derived values ($derived)
├── Effects ($effect)
├── Event handlers
├── Template with mobile-first styles
```

### **Mobile-First CSS**
```css
/* ✅ GOOD: Mobile-first, OKLCH colors */
.button {
  /* Mobile base */
  height: 44px;
  padding: 0 16px;
  background: oklch(60% 0.2 250);
  
  /* Tablet and up */
  @media (min-width: 768px) {
    height: 40px;
    padding: 0 24px;
  }
}

/* ❌ BAD: Desktop-first, hex colors */
.button {
  height: 40px;
  background: #3b82f6;
  
  @media (max-width: 767px) {
    height: 44px;
  }
}
```

## 🎨 **Component Guidelines**

### **Using @repo/ui Library**
```typescript
// Import from centralized library
import { 
  Button, 
  ProductCard, 
  Modal 
} from '@repo/ui';

// Use with mobile-first props
<Button 
  variant="primary"
  size="lg"  // 44px height
  fullWidth  // Mobile full-width
  onclick={handleClick}
>
  Add to Cart
</Button>
```

### **Touch Target Requirements**
```svelte
<!-- Primary Actions: 44px minimum -->
<button class="h-11 px-4">  <!-- 44px = 11 * 4px -->
  Buy Now
</button>

<!-- Secondary Actions: 36px minimum -->
<button class="h-9 px-3">   <!-- 36px = 9 * 4px -->
  View Details
</button>
```

### **Image Optimization**
```svelte
<script>
  import { OptimizedImage } from '@repo/ui';
</script>

<!-- Automatic lazy loading and srcset -->
<OptimizedImage
  src={product.image}
  alt={product.title}
  sizes="(max-width: 640px) 100vw, 50vw"
  loading="lazy"
  class="aspect-square object-cover"
/>
```

## 🚀 **Performance Targets**

### **Mobile Metrics**
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| LCP | <2s | 820ms | ✅ |
| FCP | <1s | 450ms | ✅ |
| TTI | <3s | 2.1s | ✅ |
| CLS | <0.1 | 0.05 | ✅ |
| Bundle | <200KB | 165KB | ✅ |

### **Optimization Techniques**
```javascript
// Code splitting
const AdminPanel = lazy(() => import('./AdminPanel.svelte'));

// Image optimization
<img 
  src="image.jpg?w=375&q=80" 
  srcset="image.jpg?w=375 375w, image.jpg?w=750 750w"
  sizes="(max-width: 640px) 100vw, 50vw"
/>

// Debounced search
import { debounce } from '$lib/utils';
const search = debounce((term) => {
  // Search logic
}, 300);
```

## 📁 **Project Structure**

### **Key Directories**
```
apps/web/src/
├── routes/              # SvelteKit pages
│   ├── (auth)/         # Auth-required routes
│   ├── (protected)/    # User dashboard area
│   └── api/            # API endpoints
├── lib/
│   ├── components/     # Page components
│   ├── server/         # Server utilities
│   ├── stores/         # Global state
│   └── utils/          # Helpers
└── app.html            # HTML template

packages/ui/src/lib/
├── components/         # Reusable UI components
├── tokens.ts          # Design tokens (OKLCH)
└── index.ts           # Public exports
```

### **File Naming**
```
PascalCase: Components (ProductCard.svelte)
camelCase: Utilities (formatPrice.ts)
kebab-case: Routes (order-history)
UPPER_SNAKE: Constants (MAX_IMAGE_SIZE)
```

## 🔍 **API Documentation**

### **Supabase Schema**
```sql
-- Key tables
profiles         -- User profiles and settings
products         -- Product listings
orders           -- Purchase orders
messages         -- User messaging
reviews          -- Ratings and reviews
favorites        -- Saved products
```

### **API Endpoints**
```typescript
// Product endpoints
GET    /api/products          // List products
GET    /api/products/[id]     // Single product
POST   /api/products          // Create listing
PATCH  /api/products/[id]     // Update listing

// Order endpoints  
POST   /api/orders            // Create order
GET    /api/orders/[id]       // Order details
PATCH  /api/orders/[id]       // Update status

// User endpoints
GET    /api/users/[id]        // Public profile
PATCH  /api/users/profile     // Update profile
```

### **Authentication Flow**
```typescript
// Supabase Auth
import { supabase } from '$lib/supabase';

// Sign up
const { user, error } = await supabase.auth.signUp({
  email,
  password,
  options: { 
    data: { username, country }
  }
});

// Protected route check
export async function load({ locals }) {
  const session = await locals.getSession();
  if (!session) {
    throw redirect(303, '/login');
  }
}
```

## 🐛 **Troubleshooting**

### **Common Issues**

**TypeScript Errors**
```bash
# Regenerate types
pnpm db:types
pnpm check-types

# Clear cache
rm -rf .svelte-kit
pnpm dev
```

**Build Failures**
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build:ui  # Build packages first
pnpm build:web
```

**Supabase Connection**
```bash
# Check environment
echo $PUBLIC_SUPABASE_URL
# Verify in Supabase dashboard
# Check service role key permissions
```

**Mobile Layout Issues**
```css
/* Ensure viewport meta tag */
<meta name="viewport" content="width=device-width, initial-scale=1">

/* Use safe area insets */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}
```

## 📚 **Resources**

### **Documentation**
- [Svelte 5 Docs](https://svelte.dev/docs)
- [SvelteKit 2 Guide](https://kit.svelte.dev)
- [Supabase Reference](https://supabase.com/docs)
- [Stripe Integration](https://stripe.com/docs)

### **Tools**
- [Svelte DevTools](https://chrome.google.com/webstore)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Mobile Viewport Tester](https://responsivedesignchecker.com)

---

*Mobile-first or nothing. Every pixel matters at 375px.*