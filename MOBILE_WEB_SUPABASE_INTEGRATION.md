# Driplo Mobile + Web Supabase Integration

## ✅ Shared Supabase Instance

The mobile app now uses **the same Supabase instance** as your web app!

### Configuration

#### Web App (SvelteKit)
- **Location:** `apps/web/src/lib/supabase/client.ts`
- **Package:** `@supabase/ssr` (for SvelteKit server-side rendering)
- **Flow:** PKCE (Proof Key for Code Exchange)
- **URL:** `https://koowfhsaqmarfdkwsfiz.supabase.co`

#### Mobile App (React Native)
- **Location:** `packages/mobile-shared/src/lib/supabase.ts`
- **Package:** `@supabase/supabase-js` (standard client)
- **Storage:** AsyncStorage (encrypted on device)
- **Flow:** PKCE (same as web)
- **URL:** Same as web! `https://koowfhsaqmarfdkwsfiz.supabase.co`

---

## 🔐 Authentication Flow

### Web (SvelteKit)
```typescript
// Uses @supabase/ssr for cookie-based auth
createBrowserClient<Database>(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true
    }
  }
)
```

### Mobile (React Native)
```typescript
// Uses AsyncStorage for session persistence
createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,        // Mobile session storage
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,     // Deep links handle this
      flowType: 'pkce',             // Same security as web
    }
  }
)
```

---

## 📊 Shared Database Schema

Both apps use the **same types** from `@repo/database`:

```typescript
// Shared types
import type { Database } from '@repo/database';

// Available in both web and mobile:
type Tables<T> = Database['public']['Tables'][T]['Row'];
type TablesInsert<T> = Database['public']['Tables'][T]['Insert'];
type TablesUpdate<T> = Database['public']['Tables'][T]['Update'];
```

### Key Tables (Shared)
- `profiles` - User profiles (mobile + web)
- `products` - Product listings
- `product_images` - Product photos
- `favorites` - User favorites
- `conversations` - Chat conversations
- `messages` - Chat messages
- `orders` - Purchase orders
- `categories` - Product categories

---

## 🔄 How Users Work Across Platforms

### User Authentication
1. **User signs up on web** → Creates `auth.users` + `public.profiles`
2. **Same user logs in on mobile** → Uses same auth system
3. **Session syncs** → Profile, favorites, messages all work

### Data Sync
- **Products created on web** → Visible on mobile instantly
- **Messages sent on mobile** → Appear on web via Realtime
- **Favorites on mobile** → Synced to web
- **Orders from either platform** → Visible everywhere

### Profile Management
- Avatar uploaded on mobile → Shows on web
- Bio edited on web → Updates on mobile
- Same user ratings across platforms

---

## 🚀 Implementation Details

### 1. Supabase Client Configuration

#### Mobile-Shared Package
```typescript
// packages/mobile-shared/src/lib/supabase.ts
export const supabase = createClient<Database>(
  'https://koowfhsaqmarfdkwsfiz.supabase.co',
  'eyJhbGciOi...', // Same anon key as web
  {
    auth: {
      storage: AsyncStorage,
      flowType: 'pkce',
    }
  }
);
```

#### Mobile App Usage
```typescript
// apps/mobile/app/(auth)/login.tsx
import { supabase } from '@repo/mobile-shared';

const { error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

### 2. Authentication Provider

The `AuthProvider` in `mobile-shared` wraps Supabase auth:

```typescript
// packages/mobile-shared/src/providers/AuthProvider.tsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Listen to auth changes (same user across web/mobile)
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);
  
  return <AuthContext.Provider value={{ user, ... }}>
}
```

### 3. Type Safety

Both platforms use the **same generated types**:

```typescript
// packages/database/src/generated.ts
export type Database = {
  public: {
    Tables: {
      profiles: { Row: {...}, Insert: {...}, Update: {...} },
      products: { Row: {...}, Insert: {...}, Update: {...} },
      // ... all tables
    }
  }
}
```

---

## 🔒 Security (RLS)

Your existing **Row Level Security policies** protect both web and mobile:

```sql
-- Example: Users can only see their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Works on both web and mobile!
```

### Why This Works
- Both apps use the same JWT tokens
- Same `auth.uid()` in RLS policies
- Same anon key (public) + RLS = secure

---

## 📱 Mobile-Specific Features

### 1. Deep Linking
```typescript
// OAuth callback
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'driplo://auth/callback', // Mobile deep link
  }
});
```

### 2. Push Notifications
```typescript
// Store Expo push token
await supabase
  .from('device_tokens')
  .insert({
    user_id: user.id,
    expo_push_token: token,
  });
```

### 3. Image Upload (Mobile Camera)
```typescript
// Pick image from camera/gallery
const result = await ImagePicker.launchCameraAsync();

// Upload to same Supabase Storage as web
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(`${user.id}/${Date.now()}.jpg`, file);
```

---

## 🎯 Key Advantages

### ✅ Single Source of Truth
- One database for all platforms
- Consistent user experience
- No data sync issues

### ✅ Code Reuse
- Shared TypeScript types
- Shared business logic (via `@repo/domain`)
- Shared utilities

### ✅ Simplified Development
- One Supabase project to manage
- Same RLS policies
- Same authentication flow

### ✅ Cost Efficient
- One Supabase subscription
- Shared storage buckets
- Combined usage limits

---

## 📝 Environment Variables

### Web (.env)
```env
PUBLIC_SUPABASE_URL=https://koowfhsaqmarfdkwsfiz.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Mobile (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=https://koowfhsaqmarfdkwsfiz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Note:** Same values! The prefix changes for framework conventions:
- SvelteKit: `PUBLIC_`
- Expo: `EXPO_PUBLIC_`

---

## 🔄 Real-time Sync

Both platforms can use **Supabase Realtime**:

### Web (SvelteKit)
```typescript
supabase
  .channel('messages')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => console.log('New message:', payload)
  )
  .subscribe();
```

### Mobile (React Native)
```typescript
supabase
  .channel('messages')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => console.log('New message:', payload)
  )
  .subscribe();
```

**Same code! Same real-time channel!**

---

## 🚦 What's Working

✅ Shared Supabase instance (same URL/keys)
✅ Same database schema (`@repo/database`)
✅ Same authentication (users work on both platforms)
✅ AsyncStorage for mobile session persistence
✅ PKCE flow for security
✅ Type-safe queries on both platforms
✅ Ready for real-time sync

---

## 📚 Resources

- **Supabase Docs:** https://supabase.com/docs
- **@supabase/ssr (Web):** https://supabase.com/docs/guides/auth/server-side/sveltekit
- **@supabase/supabase-js (Mobile):** https://supabase.com/docs/reference/javascript
- **AsyncStorage:** https://react-native-async-storage.github.io/async-storage/

---

## 🎉 Summary

**You did NOT need MCP for Supabase setup** - I used the existing Supabase configuration from your web app! 

The mobile app now:
1. ✅ Uses the same Supabase instance as web
2. ✅ Shares the same users, profiles, products, etc.
3. ✅ Uses the same type definitions from `@repo/database`
4. ✅ Has AsyncStorage for mobile-specific session persistence
5. ✅ Ready to work alongside your web app

**All dependencies installed and working!** 🚀
