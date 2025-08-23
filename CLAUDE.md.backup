# Driplo - C2C Clothing Marketplace

## Project Overview
Driplo is a consumer-to-consumer clothing marketplace platform similar to Vinted, built with modern web technologies. Users can buy and sell pre-owned and new clothing items in a clean, minimal interface.

## Architecture

### Frontend Stack
- **Framework**: Svelte 5 with SvelteKit 2
- **Language**: TypeScript
- **Styling**: TailwindCSS (to be added)
- **Build Tool**: Vite
- **Package Manager**: pnpm

### Backend Stack
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage for images
- **Real-time**: Supabase Realtime for messaging
- **Payments**: Stripe integration

### Monorepo Structure
```
driplo-turbo/
├── apps/
│   ├── web/           # Main marketplace application
│   └── docs/          # Admin dashboard & seller tools
├── packages/
│   ├── ui/            # Shared UI components
│   ├── database/      # Supabase types & utilities (to be added)
│   ├── eslint-config/ # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
```

## Development Workflow

### Getting Started
```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Build all apps
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Type check
pnpm check-types
```

### Environment Variables
Create `.env.local` files in app directories:

#### apps/web/.env.local
```
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
```

### Database Schema

#### Core Tables
- `profiles` - User profiles with seller/buyer info
- `products` - Product listings
- `categories` - Product categories
- `orders` - Purchase transactions
- `reviews` - Product and user reviews
- `messages` - Buyer-seller communication
- `favorites` - User saved products

#### Key Features
- Row Level Security (RLS) enabled on all tables
- Real-time subscriptions for messaging
- Full-text search on products
- Image storage with automatic optimization

## Key Components Structure

### Shared UI Package (`packages/ui/`)
```
src/
├── components/
│   ├── auth/          # Authentication forms
│   ├── product/       # Product cards, grids, forms
│   ├── user/          # Profile components
│   ├── messaging/     # Chat components
│   └── common/        # Buttons, modals, etc.
├── types/             # TypeScript interfaces
└── utils/             # Shared utilities
```

### Main App (`apps/web/`)
```
src/
├── routes/
│   ├── (auth)/        # Authentication pages
│   ├── product/       # Product pages
│   ├── profile/       # User profiles
│   ├── search/        # Search & filters
│   ├── messages/      # Messaging interface
│   └── dashboard/     # User dashboard
├── lib/
│   ├── supabase/      # Database client & queries
│   ├── stores/        # Svelte stores
│   └── utils/         # App utilities
└── app.html
```

## Development Guidelines

### COMPONENT REUSABILITY - CRITICAL RULES
✅ **ALWAYS reuse existing components** from `@repo/ui` package
✅ **NEVER duplicate UI logic** - check packages/ui first
✅ **BUILD once, USE everywhere** - all UI in shared package
✅ **NO component bloat** - keep apps/ directories minimal
✅ **EXTEND existing components** rather than creating new ones

### Required Component Strategy:
1. Check `packages/ui/src/` for existing components FIRST
2. Extend existing components with props/variants
3. Only create new components in @repo/ui if absolutely necessary
4. Import components consistently: `import { Component } from '@repo/ui'`
5. Keep app-specific files minimal - business logic only

### Svelte 5 + SvelteKit 2 + Turborepo Rules

#### MUST DO - Svelte 5 Runes (NEVER use legacy syntax)
✅ **DO**: Use Svelte 5 runes exclusively
```typescript
// ✅ CORRECT - Use runes
let count = $state(0);
let doubled = $derived(count * 2);
let { prop1, prop2 }: Props = $props();

// ❌ WRONG - Legacy reactive statements
$: doubled = count * 2;  // NEVER USE THIS
```

✅ **DO**: Use `$derived` for computed values
```typescript
const classes = $derived(`${baseClasses} ${variantClasses[variant]}`);
```

✅ **DO**: Use `$effect` for side effects  
```typescript
$effect(() => {
  console.log('Count changed:', count);
});
```

✅ **DO**: Use `$bindable()` for two-way binding
```typescript
let { value = $bindable() }: Props = $props();
```

#### Component Patterns - STRICT RULES
✅ **DO**: Always define Props interface
```typescript
interface Props {
  variant?: ButtonVariant;
  children?: import('svelte').Snippet;
}
let { variant = 'primary', children }: Props = $props();
```

✅ **DO**: Use snippets for children content
```typescript
{@render children?.()}
```

✅ **DO**: Export TypeScript types from packages
```typescript
export type { Product, User } from './types.js';
```

#### Turborepo Package Rules
✅ **DO**: Always build packages before using them
```bash
pnpm build --filter @repo/ui
```

✅ **DO**: Use workspace protocol for internal packages
```json
"@repo/ui": "workspace:*"
```

✅ **DO**: Follow Turborepo build dependency order
- UI package builds first
- Apps depend on packages
- Build with `pnpm build` (all) or `pnpm build --filter <package>`

#### SvelteKit 2 Routing
✅ **DO**: Use file-based routing correctly
```
src/routes/
├── +layout.svelte          # Root layout
├── +page.svelte            # Homepage
├── product/
│   └── [id]/
│       └── +page.svelte    # Dynamic route
├── (auth)/                 # Route groups
│   ├── login/
│   └── signup/
```

✅ **DO**: Use load functions for data fetching
```typescript
// +page.ts
export async function load({ params }) {
  return {
    product: await getProduct(params.id)
  };
}
```

#### TailwindCSS v3 Configuration
✅ **DO**: Use stable TailwindCSS v3 for production reliability
```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

✅ **DO**: Configure content paths properly
```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: { extend: {} },
  plugins: []
};
```

✅ **DO**: Import CSS in layout
```typescript
// +layout.svelte
import '../app.css';
```

#### NEVER DO - Forbidden Patterns
❌ **NEVER**: Use legacy Svelte syntax in Svelte 5
```typescript
// ❌ FORBIDDEN
$: computed = value * 2;
export let prop;
let:directive
```

❌ **NEVER**: Use `#` hrefs (accessibility violation)
```html
<!-- ❌ FORBIDDEN -->
<a href="#">Link</a>
<!-- ✅ CORRECT -->
<a href="/actual-route">Link</a>
```

❌ **NEVER**: Mix runes with legacy patterns
❌ **NEVER**: Ignore build errors from packages
❌ **NEVER**: Skip TypeScript interfaces for component props

### Code Style
- Use TypeScript for all new code
- Follow existing ESLint/Prettier configuration
- Use Svelte 5 runes exclusively (`$state`, `$derived`, `$effect`)
- Implement responsive design mobile-first
- Use semantic HTML and ARIA attributes
- ALWAYS follow Turborepo build order

### Component Patterns
```typescript
// Use runes for state management
let count = $state(0);
let doubled = $derived(count * 2);

// Use proper TypeScript interfaces
interface Product {
  id: string;
  title: string;
  price: number;
  // ...
}

// Export component props properly
interface Props {
  product: Product;
  onSelect?: (product: Product) => void;
}

let { product, onSelect }: Props = $props();
```

### Database Patterns
- Always use TypeScript types generated from Supabase
- Implement proper error handling for database operations
- Use RLS policies for data security
- Optimize queries with proper indexing

### Testing Strategy
- Unit tests with Vitest for utilities and stores
- Component tests with Svelte Testing Library
- E2E tests with Playwright for critical user flows
- API tests for Supabase edge functions

## Commands Reference

### Development
- `pnpm dev` - Start all development servers
- `pnpm dev --filter web` - Start only web app
- `pnpm dev --filter docs` - Start only docs app

### Building
- `pnpm build` - Build all packages and apps
- `pnpm build --filter ui` - Build only UI package

### Testing
- `pnpm test` - Run all tests
- `pnpm test:unit` - Run unit tests
- `pnpm test:integration` - Run integration tests

### Database
- `pnpm db:generate-types` - Generate TypeScript types from Supabase
- `pnpm db:reset` - Reset local database
- `pnpm db:seed` - Seed database with test data

## Deployment

### Frontend
- Web app: Vercel/Netlify
- Static generation for product pages (SEO)
- Image optimization with Supabase Storage

### Backend
- Supabase hosted PostgreSQL
- Edge functions for payment processing
- CDN for static assets

## Security Considerations
- All user inputs sanitized and validated
- RLS policies enforce data access rules
- Secure image upload with file type validation
- Payment processing handled by Stripe
- Environment variables properly secured

## CRITICAL AUTH RULES - NEVER BREAK AUTHENTICATION

### 🚨 ABSOLUTE AUTHENTICATION RULES - VIOLATION WILL BREAK PRODUCTION 🚨

### ⚠️ SUPABASE AUTH - DO NOT MODIFY
The authentication system is working correctly. Follow these rules to prevent breaking it:

#### 1. NEVER MODIFY AUTH TABLES DIRECTLY
- **NEVER** run migrations on `auth.users` table
- **NEVER** alter columns in `auth` schema tables
- **NEVER** modify `confirmation_token`, `recovery_token`, `email_change_token_new`, `email_change_token_current`
- These columns must handle NULL values - Supabase manages them internally

#### 2. AUTH ERROR HANDLING
If you encounter "Database error querying schema" with auth:
- This means auth.users has NULL token values
- Fix with: `UPDATE auth.users SET confirmation_token = COALESCE(confirmation_token, ''), recovery_token = COALESCE(recovery_token, ''), email_change_token_new = COALESCE(email_change_token_new, ''), email_change_token_current = COALESCE(email_change_token_current, '')`
- Contact Supabase support if the issue persists

#### 3. HOOKS.SERVER.TS - DO NOT BREAK
Critical auth setup in `hooks.server.ts`:
```typescript
// NEVER remove or modify this auth flow
event.locals.supabase = createServerClient(...)
event.locals.safeGetSession = async () => {...}
```

#### 4. AUTH FLOW REQUIREMENTS
- Always use `locals.safeGetSession()` not `getSession()`
- Always normalize emails: `email.toLowerCase().trim()`
- Check `onboarding_completed` after successful login
- Redirect to `/onboarding` if not completed

#### 5. TESTING AUTH
Before any auth changes:
1. Test login with existing user
2. Test signup with new user
3. Check Supabase logs: `mcp__supabase__get_logs` with service "auth"
4. Verify no "converting NULL to string" errors

#### 6. IF AUTH BREAKS
1. DO NOT panic or create scripts
2. Check logs first: `mcp__supabase__get_logs`
3. Run the NULL fix migration if needed
4. Test with a simple login attempt
5. Revert any recent auth-related changes

### 🔒 PRODUCTION AUTH SAFEGUARDS

#### BEFORE ANY CODE CHANGES:
1. **NEVER touch these files without testing:**
   - `/hooks.server.ts` - Contains critical auth middleware
   - `/routes/(auth)/login/+page.server.ts` - Login logic
   - `/routes/(auth)/signup/+page.server.ts` - Signup logic
   - `/lib/supabase/server.ts` - Server client setup
   - `/lib/supabase/client.ts` - Client setup

2. **NEVER change these patterns:**
   ```typescript
   // This MUST stay exactly as is:
   const { session, user } = await event.locals.safeGetSession();
   
   // Email normalization MUST happen:
   email.toLowerCase().trim()
   
   // Onboarding check MUST occur after login:
   if (!profile?.onboarding_completed) {
     throw redirect(303, '/onboarding');
   }
   ```

3. **ALWAYS test auth after ANY deployment:**
   - Can a user sign up?
   - Can a user log in?
   - Does onboarding redirect work?
   - Check logs for any 500 errors

#### THE NULL TOKEN BUG - PERMANENT FIX:
```sql
-- Run this if you EVER see "converting NULL to string is unsupported"
DO $$
BEGIN
  UPDATE auth.users 
  SET 
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change_token_current = COALESCE(email_change_token_current, '')
  WHERE 
    confirmation_token IS NULL 
    OR recovery_token IS NULL
    OR email_change_token_new IS NULL
    OR email_change_token_current IS NULL;
END $$;
```

#### REMEMBER:
- Auth was working perfectly as of commit `21f8386`
- The NULL token issue is a Supabase backend bug, NOT our code
- NEVER try to "improve" or "refactor" auth without extensive testing
- If auth works, DO NOT TOUCH IT

## Performance Optimization
- Lazy loading for product images
- Virtual scrolling for large product lists
- Caching strategies for frequently accessed data
- Image optimization and responsive images
- Bundle splitting and code optimization