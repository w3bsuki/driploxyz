# Messaging (DMs) – Production Fix Plan

This document captures root causes and actionable fixes for the DM issues you’re seeing (405 on send, noisy logs, conversation view not updating reliably).

## TL;DR (Do These First)
- Redeploy web and force cache bust (Edge + Service Worker). Stale bundles are posting to `?/sendMessage` and causing 405s.
- Ensure DB prerequisites are applied and Realtime is enabled:
  - Apply `migrations/006_social_features.sql` (adds `messages_with_details` view + `mark_messages_as_read` RPC).
  - Enable Realtime for `public.messages` in Supabase (INSERT/UPDATE/DELETE).
- Keep client-side send via Supabase inserts; add a server action fallback for legacy clients.
- Gate verbose logs to dev only; remove bulky console logs in production.

---

## 1) 405 POST /messages?/sendMessage

Symptoms
- Browser error: `POST https://www.driplo.xyz/messages?/sendMessage 405 (Method Not Allowed)`.

Root cause
- `?/sendMessage` is a SvelteKit form action URL. It only works if the page defines a matching server action in `+page.server.ts`.
- Current UI sends messages directly via Supabase inserts (good). Stale clients (cached SW/Edge) may still submit to `?/sendMessage` → 405.

Fix
- Preferred: Deploy current bundle and purge caches (Edge + SW). This removes the legacy POST path from clients.
- Backward‑compat (optional, safe): Keep a `sendMessage` server action to accept legacy posts.

Code (server action fallback)
- File: `apps/web/src/routes/(protected)/messages/+page.server.ts`
- Ensure this exists (or update) to accept both modern and legacy forms:

```ts
// Add/ensure this inside +page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  sendMessage: async ({ request, url, locals: { supabase, safeGetSession } }) => {
    const { session } = await safeGetSession();
    const user = session?.user;
    if (!user) return fail(401, { error: 'Unauthorized' });

    const form = await request.formData();
    const message = (form.get('message') || form.get('content') || '').toString().trim();
    let receiverId = (form.get('receiverId') || form.get('to') || '').toString();
    let productId = (form.get('productId') || form.get('product') || '').toString();

    if (!receiverId) {
      const conv = url.searchParams.get('conversation'); // `${userId}__${productId|general}`
      if (conv) {
        const [otherUserId, convProductId] = conv.split('__');
        receiverId = otherUserId || '';
        productId = convProductId && convProductId !== 'general' ? convProductId : '';
      }
    }

    if (!message) return fail(400, { error: 'Message cannot be empty' });
    if (!receiverId) return fail(400, { error: 'Receiver ID is required' });

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        product_id: productId || null,
        content: message
      });

    if (error) {
      console.error('Error sending message (action):', error);
      return fail(500, { error: 'Failed to send message' });
    }

    // Redirect back to the conversation
    const convParam = `${receiverId}__${productId || 'general'}`;
    throw redirect(303, `/messages?conversation=${convParam}`);
  }
};
```

---

## 2) Noisy Console Logs in Production

Symptoms
- Repeated logs like: “🗺️ Conversations has key? …”, “🎯 Selected conversation computed …”.

Root cause
- Debug logging ran in production (either due to stale bundles or logs not gated by env).

Fix
- Enforce dev‑only logging and add a kill‑switch:

```ts
// In any messages logging helper (e.g., +page.svelte)
import { dev } from '$app/environment';

const DEBUG_FLAG = typeof window !== 'undefined' && localStorage.getItem('debug_messages') === '1';
export function logDebug(...args: any[]) {
  if (dev || DEBUG_FLAG) console.log(...args);
}
```

- Replace any raw `console.log` in messages code with `logDebug`.
- For immediate relief, set `localStorage.removeItem('debug_messages')` in production.

Optional grep to locate noisy logs
```bash
# Look for raw logs in messages UI
rg -n "console\.log\(|🗺️|🎯|Selected conversation|Conversations has key" apps/web/src --glob '!node_modules'
```

---

## 3) Conversation View Not Updating Reliably

Symptoms
- Conversation appears selected, but thread doesn’t show or re-renders too often.

Root causes & fixes
- Guard re-initialization: only rebuild conversations when there are truly new rows.
- Keep optimistic messages minimal and let realtime backfill canonical rows.

Suggested pattern (already partially implemented)
```ts
function handleMessagesChange(newMessages: any[]) {
  // Compare existing ids to avoid loops
  const existing = new Set(Array.from(conversations.values()).flatMap(c => c.messages.map((m:any) => m.id)));
  const hasNew = newMessages.some((m) => !existing.has(m.id));
  if (hasNew) initializeConversations(newMessages);
}
```

Also recommended
- Mark messages as read using the RPC on load (already present):
  - `supabase.rpc('mark_messages_as_read', { p_sender_id, p_product_id })`
- Consider limiting server load to a single conversation when `conversation` param is present for performance and clarity.

---

## 4) Database & Realtime Checklist

- Apply `migrations/006_social_features.sql`:
  - Creates `messages_with_details` view used by server load.
  - Adds `mark_messages_as_read` RPC.
- Enable Supabase Realtime for `public.messages` (INSERT/UPDATE/DELETE).
- Keep RLS enabled for `messages`; policies already allow reading own conversations and inserting own messages.

Optional: Presence & Delivery RPCs
- `update_user_presence(status, typing_in)`
- `mark_message_delivered(message_id)`
UI already tolerates their absence (logs only).

---

## 5) Service Worker & Cache Busting

- The SW caches assets; old clients may keep stale message code.
- After deploy, confirm SW version bump (our SW uses `driplo-v${version}`):
  - Hard refresh on mobile (iOS/Android) or clear site data.
  - Vercel: purge Edge cache for `/messages*`.

---

## 6) Verification Steps

1) Legacy form (optional test) – should 303 redirect back
```bash
curl -i -X POST "https://www.driplo.xyz/messages?/sendMessage" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "message=Hello&receiverId=<UUID>&productId=<UUID-or-empty>"
```

2) Client insert – should appear instantly with realtime backfill
- Open `/messages?conversation=<otherUserId>__<productId|general>` on A and B.
- Send from A; optimistic bubble shows; B receives realtime insert; unread badge updates.

3) Read state – open a conversation; the unread badge decrements (RPC applied).

---

## 7) Production Hardening (Optional)

- Subscribe with filters to reduce realtime noise:
```ts
// Example: one channel with two filtered listeners
messageChannel
  .on('postgres_changes', { event:'*', schema:'public', table:'messages', filter:`receiver_id=eq.${user.id}` }, handleMessageChange)
  .on('postgres_changes', { event:'*', schema:'public', table:'messages', filter:`sender_id=eq.${user.id}` }, handleMessageChange)
```

- Paginate messages (e.g., last 100 per conversation) to prevent heavy initial loads.

---

## Done Right
- No more 405s (legacy posts accepted or removed).
- Clean console in production; debug only with `localStorage.debug_messages=1` if needed.
- Reliable conversation selection and realtime updates.
- DB view + RPC in place; Realtime enabled.

If you want, I can wire the server action fallback in `+page.server.ts` and push a PR, and do a pass to remove or gate any remaining logs in messages UI.
