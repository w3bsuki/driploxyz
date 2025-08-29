# Messages V1 Recovery Plan

Goal: restore working, real‑time messaging with Supabase for V1 with minimal, production‑safe changes. No new deps, no bloat.

**Current Findings**
- Route exists: `/messages` under `(protected)` group.
  - `apps/web/src/routes/(protected)/messages/+page.server.ts:1`
  - `apps/web/src/routes/(protected)/messages/+page.svelte:1`
- Real‑time is wired: `apps/web/src/lib/components/RealtimeManager.svelte:1` subscribes to `public:messages` and presence.
- DB types include tables/views: `messages`, `messages_with_details`.
  - `packages/database/src/generated.ts:messages`
  - `packages/database/src/generated.ts:messages_with_details`
- Client send bug: `+page.svelte` posts to `'/messages?/sendMessage'` (no such endpoint).
  - `apps/web/src/routes/(protected)/messages/+page.svelte:353`
- RPCs used but not typed: `mark_messages_as_read`, `mark_message_delivered`, `update_user_presence` (may be missing in prod).
  - `apps/web/src/routes/(protected)/messages/+page.server.ts:82`
  - `apps/web/src/lib/components/RealtimeManager.svelte:51`
  - `apps/web/src/routes/(protected)/messages/+page.svelte:272`

**Root Causes (likely)**
- Broken send path prevents inserts → no new messages appear.
- Missing DB view/RPCs in production → server load fails or realtime post‑processing fails.
- Realtime not enabled for `messages` table in Supabase → no live updates.

**Fix Plan (Minimal & Surgical)**
- FE: unify send flow
  - Replace fetch call with direct Supabase insert (same as `messages/new`).
  - Keep optimistic UI and let realtime backfill canonical row.
- DB: ensure schema parity
  - Create `messages_with_details` view.
  - Add indexes on `messages(sender_id, receiver_id, created_at)` and `messages(product_id, created_at)`.
  - Add RLS policies for safe read/insert/update.
  - Add RPCs (optional, non‑blocking): `mark_messages_as_read`, `mark_message_delivered`.
- Realtime: enable replication
  - Turn on Realtime for `public.messages` in Supabase (INSERT/UPDATE events).
  - Optionally filter by `sender_id/receiver_id` to reduce noise.
- Hardening: pagination + limits
  - Server load limits (e.g., last 100 per conversation) and lazy fetch older.

**Code Changes (concise)**
- apps/web/src/routes/(protected)/messages/+page.svelte:353
  - Replace fetch with insert:
    - from: `await fetch('/messages?/sendMessage', { ... })`
    - to: `await supabase.from('messages').insert({ sender_id, receiver_id, product_id, content })`
- apps/web/src/routes/(protected)/messages/+page.server.ts
  - Add limit/order and optional `conversation` param filter to reduce payload.
- apps/web/src/lib/components/RealtimeManager.svelte
  - Optionally subscribe with filters:
    - `on('postgres_changes', { event:'*', schema:'public', table:'messages', filter: 'receiver_id=eq.<uid>' }, ...)`
    - And a second with `sender_id=eq.<uid>` for updates.

**DB DDL (apply to production)**
- View: `messages_with_details`
  - Create if missing:
    - `CREATE OR REPLACE VIEW public.messages_with_details AS
       SELECT m.*, to_jsonb(s.*) AS sender, to_jsonb(r.*) AS receiver, to_jsonb(p.*) AS product
       FROM public.messages m
       LEFT JOIN public.profiles s ON s.id = m.sender_id
       LEFT JOIN public.profiles r ON r.id = m.receiver_id
       LEFT JOIN public.products p ON p.id = m.product_id;`
- Indexes:
  - `CREATE INDEX IF NOT EXISTS idx_messages_sr_created ON public.messages (sender_id, receiver_id, created_at DESC);`
  - `CREATE INDEX IF NOT EXISTS idx_messages_product_created ON public.messages (product_id, created_at DESC);`
- RLS (ensure enabled on `messages`):
  - Enable: `ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;`
  - Read own conversations:
    - `CREATE POLICY messages_read ON public.messages FOR SELECT USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
      );`
  - Insert own messages:
    - `CREATE POLICY messages_insert ON public.messages FOR INSERT WITH CHECK (
        auth.uid() = sender_id
      );`
  - Update read/delivered status (receiver only):
    - `CREATE POLICY messages_update_read ON public.messages FOR UPDATE USING (
        auth.uid() = receiver_id
      ) WITH CHECK (true);`
- RPCs (optional):
  - `mark_messages_as_read(sender uuid, product uuid | null)` → sets `is_read=true, read_at=now()` for receiver.
  - `mark_message_delivered(message_id uuid)` → sets `delivered_at=now()`.

**Verification Steps**
- Local
  - `pnpm -w build && pnpm -w check-types && pnpm -w test` (green)
  - Login, open `/messages`, ensure list loads with server data.
  - From A→B and B→A, send messages; optimistic bubble appears, realtime backfills canonical row.
  - Refresh: messages persist; unread count updates.
- Production
  - Confirm Realtime enabled for `public.messages` in Supabase.
  - Validate view existence and policies.
  - Test cross‑user DM with product and general threads.

**Rollout & Risk**
- Safe: FE change is isolated to send path; DB view/policies are additive; Realtime enablement is reversible.
- No new dependencies; no breaking API changes.

**Follow‑ups (Optional, Post‑V1)**
- Infinite scroll for long threads.
- Media attachments (storage + signed URLs).
- Delivery/read receipts via triggers instead of RPCs.

**Owners**
- FE: fix send path, add server load limits, optional realtime filters.
- BE/DB: view/policies/indexes/RPCs, enable realtime.

Done right: messages load fast, send instantly (optimistic), sync via realtime, and respect RLS.

