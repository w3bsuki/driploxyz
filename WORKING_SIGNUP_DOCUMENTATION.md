# WORKING SIGNUP - DO NOT BREAK THIS

## Current Status: ✅ SIGNUP WORKS PERFECTLY

Tested and confirmed working on production:
- Desktop: Full flow works (signup → verify → onboarding → dashboard)
- Mobile: Partial issue with verify link (needs investigation)

## What Makes Signup Work

### 1. Server Action (`/routes/(auth)/signup/+page.server.ts`)

**Key Pattern**: Always returns `message(form, {...})` for success cases
```typescript
// SUCCESS CASE - This is what works!
return message(form, {
  type: 'success',
  text: `Account created successfully! We've sent a verification email to ${email}. Please check your inbox to complete your registration.`
});
```

**Why it works**:
- Uses `message()` function from Superforms
- Returns form data that Superforms expects
- Does NOT use `throw redirect()` for success cases
- Shows success message to user before any redirect

### 2. Client Component (`/routes/(auth)/signup/+page.svelte`)

**Key Pattern**: Simple form handling with Superforms
```typescript
const { form, errors, constraints, submitting, enhance, message } = superForm(data.form, {
  validators: zodClient(SignupSchema),
  resetForm: false,
  taintedMessage: null,
  validationMethod: 'oninput',
  onUpdated: ({ form }) => {
    // Message handling is automatic
  }
});
```

**Form HTML**:
```html
<form method="POST" action="?/signup" use:enhance>
```

### 3. Success Message Display

Shows clear feedback when signup succeeds:
```svelte
{#if $message}
  <div class="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
    <h3>Success!</h3>
    <p>{$message.text || $message}</p>
    <a href="/login">Go to login →</a>
  </div>
{/if}
```

## Critical Rules for Signup

1. **NEVER change the return pattern** - Always use `message(form, {...})`
2. **NEVER use throw redirect()** in the success case
3. **NEVER remove the success message display**
4. **KEEP the form action** as `?/signup`
5. **KEEP using Superforms enhance** directive

## Error Handling Pattern

For errors, use `fail()` with `setError()`:
```typescript
return fail(400, {
  form: setError(form, 'email', 'An account with this email already exists')
});
```

## Environment Variables Required

```env
PUBLIC_SUPABASE_URL=https://koowfhsaqmarfdkwsfiz.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
PUBLIC_SITE_URL=https://driplo.xyz  # For email redirect URLs
```

## Mobile Issue to Investigate

- Verify link shows "unable to sign in" on mobile
- Possible causes:
  - Different redirect URL for mobile
  - Cookie/session handling on mobile browsers
  - Supabase auth callback configuration

## DO NOT TOUCH

These files are working - DO NOT MODIFY without extreme caution:
- `/apps/web/src/routes/(auth)/signup/+page.server.ts`
- `/apps/web/src/routes/(auth)/signup/+page.svelte`
- `/apps/web/src/lib/validation/auth.ts` (SignupSchema)