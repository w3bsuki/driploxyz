# FORM ACTIONS - SvelteKit Best Practices & Rules

**Reference**: https://svelte.dev/docs/kit/form-actions

## STRICT RULES

### 1. Form Action Structure
```typescript
// +page.server.ts
import type { Actions } from './$types';

export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    // Process form
    return { success: true };
  },
  
  login: async ({ request, cookies }) => {
    // Named action
  },
  
  logout: async ({ cookies }) => {
    // Another named action
  }
} satisfies Actions;
```

### 2. Progressive Enhancement Rules
```svelte
<!-- ✅ CORRECT - Works without JS -->
<form method="POST" action="?/login" use:enhance>
  <input name="email" type="email" required>
  <button>Submit</button>
</form>

<!-- ❌ WRONG - Requires JS -->
<form on:submit|preventDefault={handleSubmit}>
```

### 3. Form Validation
```typescript
// ✅ SERVER-SIDE (Required)
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email');
    
    if (!email || !email.includes('@')) {
      return fail(400, {
        email,
        error: 'Invalid email'
      });
    }
    // Process valid data
  }
};
```

### 4. Error Handling
```typescript
import { fail, redirect } from '@sveltejs/kit';

// Return validation errors
return fail(422, {
  values: Object.fromEntries(data),
  errors: { email: 'Required' }
});

// Redirect on success
redirect(303, '/dashboard');
```

### 5. use:enhance Rules
```svelte
<script>
  import { enhance } from '$app/forms';
</script>

<form use:enhance={({ formData, cancel }) => {
  // Before submit
  if (!confirm('Sure?')) {
    cancel();
  }
  
  return async ({ result, update }) => {
    // After submit
    if (result.type === 'success') {
      // Custom handling
    }
    update(); // Apply default behavior
  };
}}>
```

### 6. File Uploads
```svelte
<form method="POST" enctype="multipart/form-data" use:enhance>
  <input type="file" name="avatar" accept="image/*">
</form>
```

```typescript
const file = data.get('avatar') as File;
if (file.size > 5_000_000) {
  return fail(413, { error: 'File too large' });
}
```

## ANTI-PATTERNS TO AVOID

### ❌ Client-Only Validation
```svelte
<!-- WRONG - No server validation -->
<script>
  function handleSubmit() {
    if (!email.includes('@')) {
      error = 'Invalid';
    }
  }
</script>
```

### ❌ Using fetch() for forms
```svelte
<!-- WRONG -->
<script>
  async function submit() {
    await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
</script>
```

### ❌ Forgetting CSRF
```typescript
// WRONG - Disabled CSRF
csrf: {
  checkOrigin: false // NEVER DO THIS
}
```

## SUPABASE FORM PATTERNS

### 1. Auth Forms
```typescript
export const actions = {
  signup: async ({ request, locals }) => {
    const data = await request.formData();
    const email = data.get('email')?.toString();
    const password = data.get('password')?.toString();
    
    const { error } = await locals.supabase.auth.signUp({
      email,
      password
    });
    
    if (error) {
      return fail(400, { error: error.message });
    }
    
    redirect(303, '/verify-email');
  }
};
```

### 2. Data Forms
```typescript
export const actions = {
  create: async ({ request, locals }) => {
    const { user } = await locals.safeGetSession();
    if (!user) redirect(303, '/login');
    
    const data = await request.formData();
    const { error } = await locals.supabase
      .from('products')
      .insert({
        title: data.get('title'),
        user_id: user.id
      });
    
    if (error) {
      return fail(500, { error: 'Database error' });
    }
    
    return { success: true };
  }
};
```

## COMMANDS TO AUDIT

```bash
# Find forms without method="POST"
grep -r "<form" src/routes | grep -v 'method="POST"'

# Find client-side form handling
grep -r "on:submit" src/routes

# Check for fetch in form handling
grep -r "fetch.*POST" src/routes

# Find forms without use:enhance
grep -r '<form method="POST"' src/routes | grep -v "use:enhance"
```