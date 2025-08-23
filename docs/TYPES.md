# TYPES - TypeScript & Type Safety

**Reference**: https://svelte.dev/docs/kit/types

## GENERATED TYPES

### 1. Route Types
```typescript
// .svelte-kit/types/src/routes/product/[id]/$types.d.ts
import type * as Kit from '@sveltejs/kit';

export type PageParams = {
  id: string;
};

export type PageLoad = Kit.Load<PageParams>;
export type PageData = Kit.PageData<typeof import('./+page.server.js').load>;
export type Actions = Kit.Actions<typeof import('./+page.server.js').actions>;
```

### 2. Using Generated Types
```typescript
// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  // params.id is typed as string
  const product = await fetch(`/api/product/${params.id}`);
  return {
    product: await product.json()
  };
};
```

### 3. Server Types
```typescript
// +page.server.ts
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  // Full typing for server context
  return {
    user: locals.user,
    productId: params.id
  };
};

export const actions: Actions = {
  update: async ({ request, params }) => {
    // Typed form actions
  }
};
```

## APP NAMESPACE

### 1. App.d.ts Configuration
```typescript
// src/app.d.ts
declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;
    }
    
    interface Locals {
      user: import('$lib/types').User | null;
      session: import('$lib/types').Session | null;
      supabase: import('@supabase/supabase-js').SupabaseClient;
      safeGetSession: () => Promise<{
        session: Session | null;
        user: User | null;
      }>;
    }
    
    interface PageData {
      flash?: { type: 'success' | 'error'; message: string };
    }
    
    interface Platform {
      env: {
        COUNTER: DurableObjectNamespace;
      };
      context: {
        waitUntil(promise: Promise<any>): void;
      };
      caches: CacheStorage & { default: Cache };
    }
  }
}

export {};
```

### 2. Custom Types
```typescript
// $lib/types/index.ts
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  user_id: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
```

## SVELTE COMPONENT TYPES

### 1. Component Props
```typescript
// Component.svelte
<script lang="ts">
  interface Props {
    title: string;
    count?: number;
    variant?: 'primary' | 'secondary';
    onclick?: (event: MouseEvent) => void;
  }
  
  let { 
    title, 
    count = 0, 
    variant = 'primary',
    onclick
  }: Props = $props();
</script>
```

### 2. Generic Components
```typescript
<script lang="ts" generics="T">
  interface Props<T> {
    items: T[];
    selected?: T;
    onselect?: (item: T) => void;
  }
  
  let { items, selected, onselect }: Props<T> = $props();
</script>
```

### 3. Slot Props
```typescript
<script lang="ts">
  interface Props {
    children: import('svelte').Snippet;
    header?: import('svelte').Snippet<[{ title: string }]>;
  }
  
  let { children, header }: Props = $props();
</script>

{#if header}
  {@render header({ title: 'Hello' })}
{/if}
```

## STORE TYPES

### 1. Typed Stores
```typescript
// $lib/stores/cart.ts
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { CartItem } from '$lib/types';

interface CartStore {
  items: CartItem[];
  total: number;
}

export const cart: Writable<CartStore> = writable({
  items: [],
  total: 0
});
```

### 2. Custom Store
```typescript
interface UserStore {
  subscribe: Readable<User | null>['subscribe'];
  set: (user: User | null) => void;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
}

function createUserStore(): UserStore {
  const { subscribe, set, update } = writable<User | null>(null);
  
  return {
    subscribe,
    set,
    async login(credentials) {
      const user = await api.login(credentials);
      set(user);
    },
    async logout() {
      await api.logout();
      set(null);
    }
  };
}
```

## FORM TYPES

### 1. Form Actions
```typescript
// +page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');
    
    // Type guards
    if (typeof email !== 'string' || typeof password !== 'string') {
      return fail(400, { 
        email,
        missing: true 
      });
    }
    
    // Typed return
    return {
      type: 'success' as const,
      data: { userId: '123' }
    };
  }
};
```

### 2. Form Data Validation
```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const actions: Actions = {
  login: async ({ request }) => {
    const formData = Object.fromEntries(await request.formData());
    
    try {
      const data = loginSchema.parse(formData);
      // data is fully typed
    } catch (error) {
      if (error instanceof z.ZodError) {
        return fail(400, {
          errors: error.flatten().fieldErrors
        });
      }
    }
  }
};
```

## API TYPES

### 1. API Routes
```typescript
// +server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, params }) => {
  // Fully typed parameters
  const page = url.searchParams.get('page') || '1';
  
  return json({
    data: [],
    page: parseInt(page)
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json() as CreateProductDto;
  
  return json({ id: '123' }, { status: 201 });
};
```

### 2. Type-safe Fetch
```typescript
// $lib/api.ts
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json() as T;
}

// Usage
const products = await fetchAPI<Product[]>('/products');
```

## SUPABASE TYPES

### 1. Database Types
```typescript
// $lib/database.types.ts
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
        };
        Update: {
          name?: string;
          price?: number;
        };
      };
    };
  };
};
```

### 2. Typed Queries
```typescript
import type { Database } from '$lib/database.types';

const supabase = createClient<Database>(url, key);

// Fully typed
const { data, error } = await supabase
  .from('products')
  .select('id, name, price')
  .eq('user_id', userId);
  
// data is typed as { id: string; name: string; price: number }[]
```

## UTILITY TYPES

### 1. Helper Types
```typescript
// $lib/types/utils.ts
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  T extends (...args: any) => Promise<infer R> ? R : never;

// Extract props type from component
export type ComponentProps<T> = T extends new (...args: any) => { $$prop_def: infer P } ? P : never;
```

### 2. Discriminated Unions
```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchProduct(id: string): Promise<Result<Product>> {
  try {
    const product = await api.getProduct(id);
    return { success: true, data: product };
  } catch (error) {
    return { success: false, error };
  }
}
```

## TSCONFIG

### 1. Configuration
```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler",
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.js", "src/**/*.svelte"]
}
```

### 2. Path Aliases
```json
{
  "compilerOptions": {
    "paths": {
      "$lib": ["./src/lib"],
      "$lib/*": ["./src/lib/*"],
      "$components": ["./src/lib/components"],
      "$types": ["./src/lib/types"]
    }
  }
}
```

## TYPE GUARDS

```typescript
// Type predicates
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
}

// Assertion functions
function assertUser(obj: any): asserts obj is User {
  if (!isUser(obj)) {
    throw new Error('Not a valid user');
  }
}

// Usage
if (isUser(data)) {
  // data is User
  console.log(data.email);
}
```

## RULES

- Always run `svelte-kit sync` before type checking
- Use generated types from `./$types`
- Define App namespace types in app.d.ts
- Prefer interfaces over type aliases for objects
- Use strict mode in tsconfig
- Validate external data at boundaries
- Use discriminated unions for state
- Avoid `any`, use `unknown` if needed
- Export types from central location
- Use generic components when reusable

## AUDIT COMMANDS

```bash
# Generate types
pnpm sync

# Type check
pnpm check

# Strict type check
npx tsc --noEmit --strict

# Find any usage
grep -r ": any" src/ --include="*.ts" --include="*.svelte"

# Find missing types
grep -r "// @ts-" src/
```