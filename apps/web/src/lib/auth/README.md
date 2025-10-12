# 🔐 CONSOLIDATED AUTH SYSTEM

**Production-ready authentication for SvelteKit 2 + Supabase SSR + Svelte 5**

This is the **single source of truth** for all authentication in the web app. It replaces the previous fragmented system with a clean, modern implementation that follows current best practices.

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   SERVER-SIDE   │    │   CLIENT-SIDE    │    │   COMPONENTS    │
│                 │    │                  │    │                 │
│ • hooks.ts      │◄──►│ store.svelte.ts  │◄──►│ AuthProvider    │
│ • +layout.load  │    │ • Svelte 5 runes │    │ AuthErrorBound  │
│ • auth guards   │    │ • Reactive state │    │ • Clean UI      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
    ┌────▼────┐              ┌────▼────┐              ┌────▼────┐
    │ Session │              │ Auth    │              │ Error   │
    │ Mgmt    │              │ State   │              │ Handling│
    └─────────┘              └─────────┘              └─────────┘
```

## 📁 File Structure

```
apps/web/src/lib/auth/
├── index.ts              # Core auth functions & types
├── store.svelte.ts       # Svelte 5 reactive auth store
├── hooks.ts              # SvelteKit hooks integration
├── onboarding.ts         # User onboarding logic
├── AuthProvider.svelte   # Client-side auth initialization
├── AuthErrorBoundary.svelte  # Error handling component
└── README.md            # This documentation
```

## 🚀 Quick Start

### Using Auth in Components

```typescript
import { authStore } from '$lib/auth/store.svelte';

// In your component
if (authStore.isAuthenticated) {
  // User is signed in
  console.log('Welcome', authStore.displayName);
}

// Check if user can sell
if (authStore.canSell) {
  // Show seller features
}

// Access user data
const profile = authStore.profile;
const user = authStore.user;
```

### Using Auth in Server Load Functions

```typescript
import { requireAuth, getUserProfile } from '$lib/auth';

export const load = async ({ locals: { safeGetSession, supabase } }) => {
  const { session, user } = await safeGetSession();

  // Protect route
  requireAuth(user);

  // Get profile
  const profile = await getUserProfile(supabase, user.id);

  return { user, profile };
};
```

### Auth API Routes

```typescript
import { createServerSupabase } from '$lib/auth';

export const POST = async ({ cookies, fetch }) => {
  const supabase = createServerSupabase(cookies, fetch);

  // Perform auth operations
  const { error } = await supabase.auth.signUp({...});

  return json({ success: !error });
};
```

## 🎯 Key Features

### ✅ What's Fixed

- **Single Source of Truth**: All auth logic in one place
- **Proper SSR/CSR Boundaries**: Server and client auth handled correctly
- **Svelte 5 Runes**: Modern reactive patterns with `$state`, `$derived`, `$effect`
- **Type Safety**: Full TypeScript throughout
- **Performance**: Minimal overhead, efficient session management
- **Error Handling**: Graceful error boundaries and fallbacks
- **Clean Onboarding**: Simple profile completion flow

### 🗑️ What's Removed

- **Fragmented Files**: Multiple auth clients and helpers
- **Over-caching**: Complex session caching that caused bugs
- **Mixed Patterns**: Old reactive statements mixed with new code
- **Duplicate Logic**: Auth validation in multiple places
- **Over-engineering**: Complex flows that weren't needed

## 📝 API Reference

### Core Functions

```typescript
// Server-side
createServerSupabase(cookies, fetch)  // Create Supabase client
getServerSession(event)               // Get session with validation
getUserProfile(supabase, userId)      // Get user profile
requireAuth(user, redirectTo?)        // Enforce authentication

// Client-side
createBrowserSupabase()               // Create browser client
signOut(supabase)                     // Sign out user
canSell(profile)                      // Check seller permissions
isAdmin(profile)                      // Check admin permissions
```

### Auth Store

```typescript
// State
authStore.user                        // Current user
authStore.session                     // Current session
authStore.profile                     // User profile
authStore.loading                     // Loading state
authStore.isAuthenticated            // Authentication status

// Derived state
authStore.canSell                    // Can user sell items
authStore.isAdmin                    // Is user admin
authStore.displayName                // User display name
authStore.userInitials               // User initials for avatar

// Actions
authStore.signIn(email, password)   // Sign in user
authStore.signUp(email, password)   // Sign up user
authStore.signOut()                  // Sign out user
authStore.getSupabase()             // Get Supabase client
```

### Onboarding

```typescript
completeOnboarding(supabase, user, data)  // Complete user onboarding
checkUsernameAvailability(supabase, username)  // Check username
getOnboardingProgress(profile)        // Get progress status
```

## 🔧 Configuration

The system automatically uses environment variables:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

## 🛡️ Security

- ✅ Server-side session validation
- ✅ Secure cookie handling
- ✅ CSRF protection (via existing middleware)
- ✅ SQL injection protection (Supabase RLS)
- ✅ XSS protection (Svelte escaping)

## 🚨 Migration Guide

### Before (Old System)
```typescript
// Multiple imports needed
import { authStore } from '$lib/stores/auth.svelte';
import { createSupabaseServerClient } from '$lib/server/auth';
import { setupAuth } from '$lib/server/supabase-hooks';

// Complex session handling
const { session } = await locals.safeGetSession();
if (locals.__sessionCache) { /* complex caching */ }
```

### After (New System)
```typescript
// Single import
import { authStore } from '$lib/auth/store.svelte';
import { createServerSupabase, getServerSession } from '$lib/auth';

// Simple session handling
const { session, user } = await getServerSession(event);
```

## 🧪 Testing

The auth system is designed to be easily testable:

```typescript
// Mock the store for tests
const mockAuthStore = {
  isAuthenticated: true,
  user: { id: '123', email: 'test@example.com' },
  profile: { username: 'testuser' }
};
```

## ⚡ Performance

- **Minimal bundle size**: Only imports what's needed
- **Efficient reactivity**: Svelte 5 fine-grained updates
- **Smart caching**: Session validation cached per request
- **Lazy loading**: Client-side auth initialized only when needed

## 🐛 Troubleshooting

### Common Issues

1. **"Session not found"**: Check if Supabase env vars are set
2. **"Cannot read user"**: Ensure AuthProvider wraps your components
3. **TypeScript errors**: Check database types are up to date

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('auth:debug', 'true');

// Check auth state
console.log('Auth State:', authStore.authState);
```

## 🔄 How It Works

1. **Server Request**: SvelteKit hooks set up Supabase client
2. **Session Check**: Server validates session and gets user
3. **Data Loading**: Layout loads profile data in parallel
4. **Client Init**: AuthProvider initializes client-side store
5. **Reactive UI**: Components react to auth state changes
6. **Auth Actions**: Store methods handle sign in/out/up

## 📚 Best Practices

### ✅ Do
- Use `authStore` for reactive auth state
- Call `requireAuth()` in protected server load functions
- Wrap auth-sensitive components with `AuthErrorBoundary`
- Use TypeScript for all auth-related code

### ❌ Don't
- Create additional auth clients or stores
- Mix old reactive statements (`$:`) with new runes
- Access `locals.supabase` directly (use helper functions)
- Skip server-side auth validation

## 🎉 Benefits

- **Developer Experience**: Simple, consistent API
- **Performance**: Fast, efficient session management
- **Maintainability**: Single source of truth
- **Reliability**: Proper error handling and fallbacks
- **Modern**: Latest SvelteKit 2 + Svelte 5 patterns
- **Production Ready**: Built for scale and reliability

---

**Need help?** Check the individual files for detailed implementation examples, or refer to existing usage patterns in the codebase.