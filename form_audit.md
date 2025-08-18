# Form Audit: Auth (Login/Signup) and /sell

Scope: SvelteKit 2 + Svelte 5 forms and actions for:
- Auth: Login and Signup
- Listing flow: /sell

Assumption: Using server actions (`+page.server.ts`) and progressive enhancement with `form` and `use:enhance`.

## High‑Level Recommendations

- Validation: Use Zod schemas shared between server and client.
- Progressive enhancement: Always render a regular `<form method="POST">`; enhance for client UX.
- Server source of truth: Re-run all validation on the server; never trust client-only checks.
- Errors: Return structured field errors and a summary; map them to `aria-invalid` and `aria-describedby`.
- Security: Use SvelteKit’s CSRF protections (origin checks), validate `referer` when sensible, and never trust redirect targets.
- UX: Disable submit during request, show spinner, preserve typed values, and focus the first error automatically.
- Accessibility: Labels for inputs, logical tab order, error summary link targets first invalid field.

## Library Choice

- Recommended: `sveltekit-superforms` (Superforms) with Zod
  - Server-first, typed, great error propagation, file support, works with Zod/Valibot, solid PE story, and good SvelteKit 2 + Svelte 5 compatibility.
- Lean alternative: Native SvelteKit actions + `use:enhance` + Zod
  - Minimal deps, fully suitable for many apps; requires a bit more glue for error mapping/typing.
- Felte: Client-first validation; still must double-validate on the server. Prefer Superforms or vanilla actions for security and consistency.

## Auth: Login

- Fields:
  - email: `type="email"`, `autocomplete="email"`, `inputmode="email"`, normalize to lowercase server-side.
  - password: `type="password"`, `autocomplete="current-password"`.
- UX:
  - Keep errors generic for invalid credentials.
  - Disable button while submitting; focus the first error.
  - Support `redirectTo` query but whitelist destinations.
- Security:
  - Rate limit by IP and account key; exponential backoff/temporary lock.
  - Rotate session ID on login to prevent fixation.
  - Session cookie: `HttpOnly`, `Secure`, `SameSite=Lax|Strict`, short-lived with refresh.
  - Optional: soft CAPTCHA after repeated failures.
- Server Validation:
  - Validate email format + existence and password length; return generic auth error.

## Auth: Signup

- Fields:
  - name: `autocomplete="name"`.
  - email: same as login; check uniqueness.
  - password: min length (>= 10 recommended), policy as needed.
  - confirmPassword: match check server-side.
- UX:
  - Strength meter (client), approve server-only.
  - Email verification before enabling account; throttle resends.
- Security:
  - Require verified email before letting users sell.
  - Hash with Argon2id (preferred) or scrypt.
  - CSRF origin checks (built-in with SvelteKit actions).
  - Bot resistance: Honeypot + time-based submit check; soft CAPTCHA after repeated failures.

## /sell Form (Create Listing)

- Core fields:
  - title: required, length cap (e.g., 100).
  - description: required, length cap (e.g., 2000–5000).
  - price: numeric, currency-aware; store as integer minor units.
  - category: required; server-validate against allowed set.
  - condition: enum (e.g., new/like-new/good/fair).
  - sku/slug: unique; enforce uniqueness server-side; slug from title with collision handling.
  - quantity/inventory: integer >= 0.
- Images/Uploads:
  - `accept="image/*"`; client checks are helpful, but definitive server-side validation for type/size/dimensions.
  - Use object storage with presigned URLs; validate keys on finalize action; strip EXIF if needed.
  - Limit count (e.g., ≤ 10), max size per file (e.g., 10 MB).
- Shipping:
  - Dimensions + weight with units; validate as numbers with sensible caps.
  - Regions or methods validated against allowed sets.
- Publishing:
  - Draft vs Publish; allow save as draft without full completeness.
  - Preview rendering path; sanitize any rich text.
- Anti-fraud:
  - Content moderation on title/description/images server-side (queue if needed).
  - Rate-limit listing creation and edits.

## Accessibility

- Labels: `<label for="id">` paired with inputs; no placeholder-as-label.
- Errors: Per-field error text and `aria-describedby`; error summary at top linking to first invalid field.
- Keyboard: Visible focus, logical order, submit on Enter; Escape cancels dialogs.
- Announcements: `role="alert"` or `aria-live="polite"` for async error/success.
- Autocomplete: Use correct tokens (see appendix).

## Performance and UX

- Keep client JS light; rely on server actions and PE.
- Optimistic UI cautiously (e.g., image gallery) while server confirms.
- Preserve scroll and input on failed submission.
- Avoid double-submits with disabled button and idempotency keys on server.

## Implementation Patterns

### Zod Schemas (shared)

- `src/lib/validation/auth.ts`
  - `LoginSchema`: email, password
  - `SignupSchema`: name, email, password, confirmPassword
- `src/lib/validation/sell.ts`
  - `SellSchema`: title, description, priceMinor, currency, categoryId, condition, images[], quantity, shipping

Example (auth):

```ts
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128)
});

export const SignupSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().max(254),
  password: z.string().min(10).max(128),
  confirmPassword: z.string()
}).refine((v) => v.password === v.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords must match'
});
```

### With sveltekit-superforms

Server (e.g., `src/routes/(auth)/login/+page.server.ts`):

```ts
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { LoginSchema } from '$lib/validation/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const form = await superValidate(zod(LoginSchema));
  return { form };
};

export const actions: Actions = {
  default: async ({ request, locals, getClientAddress, url }) => {
    const form = await superValidate(request, zod(LoginSchema));
    if (!form.valid) return { form };

    const ok = await locals.auth.login(
      form.data.email.toLowerCase(),
      form.data.password,
      { ip: getClientAddress() }
    );
    if (!ok) {
      form.message = 'Invalid email or password';
      return { form, status: 400 };
    }

    const redirectTo = url.searchParams.get('redirectTo');
    const safe = redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/';
    return { form, redirect: safe };
  }
};
```

Page (e.g., `src/routes/(auth)/login/+page.svelte`):

```svelte
<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  export let data;
  const { form, enhance, errors, message, submitting } = superForm(data.form);
</script>

<form method="POST" use:enhance aria-describedby="error-summary">
  {#if message}<div id="error-summary" role="alert">{message}</div>{/if}

  <label for="email">Email</label>
  <input id="email" name="email" type="email" autocomplete="email" aria-invalid={!!errors.email} aria-describedby="email-error" />
  {#if errors.email}<div id="email-error" role="alert">{errors.email}</div>{/if}

  <label for="password">Password</label>
  <input id="password" name="password" type="password" autocomplete="current-password" aria-invalid={!!errors.password} aria-describedby="password-error" />
  {#if errors.password}<div id="password-error" role="alert">{errors.password}</div>{/if}

  <button disabled={submitting}>Sign in</button>
</form>
```

### Without a library (lean)

Server (e.g., `src/routes/(auth)/signup/+page.server.ts`):

```ts
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { SignupSchema } from '$lib/validation/auth';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const raw = Object.fromEntries(formData as any);
    const parsed = SignupSchema.safeParse(raw);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return fail(400, { fieldErrors, values: raw });
    }

    const { name, email, password } = parsed.data;
    const user = await locals.db.createUser({ name, email: email.toLowerCase(), password });
    if (!user) return fail(400, { message: 'Could not create account' });

    throw redirect(303, '/welcome');
  }
};
```

Page (e.g., `src/routes/(auth)/signup/+page.svelte`):

```svelte
<script lang="ts">
  export let form; // { fieldErrors, values, message }
  let submitting = $state(false);
  function onSubmit() { submitting = true; }
</script>

<form method="POST" on:submit={onSubmit} aria-describedby="error-summary">
  {#if form?.message}<div id="error-summary" role="alert">{form.message}</div>{/if}

  <label for="name">Name</label>
  <input id="name" name="name" autocomplete="name" value={form?.values?.name ?? ''} aria-invalid={!!form?.fieldErrors?.name} aria-describedby="name-error" />
  {#if form?.fieldErrors?.name}<div id="name-error" role="alert">{form.fieldErrors.name}</div>{/if}

  <!-- Repeat for email/password/confirmPassword -->
  <button disabled={submitting}>Create account</button>
</form>
```

### /sell with files

- Prefer a two-step flow:
  1) Request presigned URL(s) from server action for each file.
  2) Upload directly to storage.
  3) Submit final listing with keys/metadata; server validates that keys belong to user and types are allowed.

Server zod example (sell):

```ts
import { z } from 'zod';

export const SellSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(5000),
  priceMinor: z.coerce.number().int().min(1).max(10_000_000),
  currency: z.enum(['USD','EUR','GBP']),
  categoryId: z.string().cuid(),
  condition: z.enum(['new','like-new','good','fair']),
  quantity: z.coerce.number().int().min(0).max(10000),
  imageKeys: z.array(z.string()).max(10)
});
```

## Security Checklist

- CSRF: Use SvelteKit form actions (origin checked). Avoid cross-origin fetch POSTs.
- Open redirects: Validate `redirectTo` starts with single `/` and is from a known set.
- Sessions:
  - `HttpOnly`, `Secure`, `SameSite=Lax|Strict`, short expiry with refresh.
  - Rotate on login; invalidate on logout.
- Rate limiting: Per-IP + per-identifier for login, signup, listing creation.
- Passwords: Argon2id with per-user salt; optional app-level pepper.
- Brute-force: Backoff/lockout; optional 2FA; soft CAPTCHA after repeated failures.
- Uploads: Validate MIME, size, dimensions server-side; store outside web root; scan as needed.
- Headers: CSP, Referrer-Policy, X-Content-Type-Options, Permissions-Policy; avoid unsafe inline scripts (or hash them).

## Accessibility Checklist

- Each input has `<label for>`; no placeholder-only labels.
- Errors both inline and summarized; error summary links to first invalid input.
- Use `aria-invalid`, `aria-describedby` for errors/hints.
- `autocomplete` set per field; see appendix.
- Focus returns to first error on failed submit.

## Testing

- Unit: Zod schemas—valid and invalid cases.
- Integration: Actions—success/failure paths return proper `fail(400)` and error shapes.
- E2E (Playwright):
  - Login/signup happy paths, invalid email/password, redirect safety.
  - /sell: cannot publish without required fields; can save draft; image limits enforced.

## Migration Steps to Superforms (if adopting)

1) Extract and export Zod schemas per form in `$lib/validation`.
2) Update `+page.server.ts` to use `superValidate` in `load` and `actions`.
3) Replace manual error mapping with Superforms return shapes.
4) In pages, use `superForm()` to wire `enhance`, `submitting`, `errors`, and `message`.
5) Ensure types align; add tests for server validation parity.

## Appendix: autocomplete tokens

- Login: email → `email`, password → `current-password`
- Signup: name → `name`, email → `email`, password → `new-password`, confirm → `new-password`
- Address (if in /sell): `address-line1`, `address-line2`, `postal-code`, `country`, `name`, `tel`
- Payment (if applicable): Prefer PSP widgets; never collect raw PAN directly

