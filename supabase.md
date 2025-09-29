# Supabase Guide

PostgreSQL database, authentication, and storage via Supabase.

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| **profiles** | User profiles and seller information |
| **products** | Product listings with images and details |
| **orders** | Order management and status tracking |
| **messages** | Peer-to-peer messaging between users |
| **transactions** | Payment records and history |
| **favorites** | User saved products |
| **reviews** | Product and seller reviews |
| **categories** | Product category hierarchy |
| **notifications** | User notifications |
| **followers** | User follow relationships |
| **seller_balances** | Seller payout balances |

### Key Relationships

```
profiles (user)
  ├─> products (seller)
  ├─> orders (buyer)
  ├─> messages (sender/receiver)
  ├─> reviews (author)
  └─> transactions (buyer/seller)

products
  ├─> orders (product)
  ├─> favorites (product)
  ├─> reviews (product)
  └─> categories (category)
```

---

## Running Migrations

### Local Development

```bash
# Start local Supabase
supabase start

# Create migration
supabase migration new add_feature_name

# Edit migration file
# supabase/migrations/YYYYMMDDHHMMSS_add_feature_name.sql

# Apply migration
supabase db push

# Generate types
pnpm --filter @repo/database db:types
```

### Production

```bash
# Push to remote Supabase project
supabase db push --linked

# Generate types for production
pnpm --filter @repo/database db:types
```

---

## Type Generation

**Automatic type generation** from Supabase schema:

```bash
# Generate TypeScript types
pnpm --filter @repo/database db:types

# Output: packages/database/src/generated.ts
```

**Usage in code:**

```typescript
import type { Database } from '@repo/database';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function fetchProducts(
  supabase: SupabaseClient<Database>
) {
  const { data, error } = await supabase
    .from('products')
    .select('*');

  return { data, error };
}
```

---

## Row Level Security (RLS)

**All tables have RLS enabled** with policies enforcing data isolation.

### Key Patterns

#### Public Read, User Write
```sql
-- profiles: Anyone can read, users manage own
CREATE POLICY "Public can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### Participant Access
```sql
-- orders: Only buyer and seller can view
CREATE POLICY "Participants can view orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = buyer_id
    OR auth.uid() = seller_id
  );
```

#### Admin Management
```sql
-- categories: Only admins can manage
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

### Testing RLS

```typescript
// Test user can only access own data
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', 'other-user-id');
// Should return empty or error

// Test user can access own data
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);
// Should return user's profile
```

---

## Authentication

### Session Management

**Server-side (hooks.server.ts):**

```typescript
import { createServerClient } from '@supabase/ssr';

export const handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    process.env.PUBLIC_SUPABASE_URL,
    process.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => event.cookies.get(key),
        set: (key, value, options) => {
          event.cookies.set(key, value, options);
        },
        remove: (key, options) => {
          event.cookies.delete(key, options);
        }
      }
    }
  );

  event.locals.session = await event.locals.supabase.auth.getSession();

  return resolve(event);
};
```

**Client-side (+layout.ts):**

```typescript
import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const load = async ({ data, depends }) => {
  depends('supabase:auth');

  const supabase = createBrowserClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: { session } } = await supabase.auth.getSession();

  return { supabase, session };
};
```

### Protected Routes

```typescript
// +page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  if (!locals.session) {
    return redirect(303, '/login');
  }

  return { session: locals.session };
}) satisfies PageServerLoad;
```

### Auth Actions

```typescript
// Login
const { error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Signup
const { error } = await supabase.auth.signUp({
  email,
  password
});

// Logout
const { error } = await supabase.auth.signOut();

// OAuth
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});
```

---

## Storage

**Profile images and product photos** stored in Supabase Storage.

### Upload File

```typescript
const file = event.target.files[0];

const { data, error } = await supabase.storage
  .from('products')
  .upload(`${userId}/${file.name}`, file);

if (data) {
  const publicUrl = supabase.storage
    .from('products')
    .getPublicUrl(data.path);
}
```

### Storage Policies

```sql
-- Public can read product images
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

-- Users can upload to their own folder
CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## Local Development

### Setup

```bash
# Install Supabase CLI
brew install supabase/tap/supabase
# or
npm install -g supabase

# Initialize
supabase init

# Start local stack
supabase start
```

### Seeding Data

```sql
-- supabase/seed.sql
INSERT INTO categories (name, slug) VALUES
  ('Electronics', 'electronics'),
  ('Clothing', 'clothing'),
  ('Home', 'home');

INSERT INTO profiles (id, username, email) VALUES
  ('user-1', 'alice', 'alice@example.com'),
  ('user-2', 'bob', 'bob@example.com');
```

```bash
# Apply seed
supabase db reset
```

---

## Environment Variables

**Client-side (PUBLIC_*):**
```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Server-side:**
```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Add to `.env.example`:**
```bash
# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Common Queries

### Fetch with Relations

```typescript
const { data } = await supabase
  .from('products')
  .select(`
    *,
    profile:profiles(username, avatar),
    category:categories(name)
  `)
  .eq('status', 'active');
```

### Insert with Return

```typescript
const { data, error } = await supabase
  .from('orders')
  .insert({
    buyer_id: userId,
    product_id: productId,
    total: 100
  })
  .select()
  .single();
```

### Update

```typescript
const { error } = await supabase
  .from('profiles')
  .update({ bio: 'New bio' })
  .eq('id', userId);
```

### Delete

```typescript
const { error } = await supabase
  .from('favorites')
  .delete()
  .eq('user_id', userId)
  .eq('product_id', productId);
```

---

## Troubleshooting

### Type Mismatch

```bash
# Regenerate types when schema changes
pnpm --filter @repo/database db:types
```

### RLS Blocking Query

```typescript
// Debug RLS policies
const { data, error} = await supabase.rpc('check_rls', {
  table_name: 'products',
  user_id: userId
});
```

### Migration Conflicts

```bash
# Reset local database
supabase db reset

# Pull remote state
supabase db pull
```

---

## See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow
- [TESTING.md](./TESTING.md) - Testing database queries