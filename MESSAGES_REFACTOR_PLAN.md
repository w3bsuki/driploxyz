# /messages Refactor Plan (Production-Ready)

Audience: claude-code (implementation), with precise steps and code/SQL to make messaging work reliably: existing messages show up (e.g., for user “Tintin”), DMs can be sent/received, realtime updates are consistent, and security is correct.

---

## Executive Summary

- Current breakages:
  - Missing DB RPCs used by UI: `get_user_conversations`, `get_conversation_messages`, `mark_conversation_read` are called but not defined in migrations.
  - Edge Function `send-message` inserts a non-existent column (`message_type`) and broadcasts on a channel the app doesn’t listen to.
  - Realtime wiring is split between a broadcast channel and Postgres changes; they’re inconsistent.
  - A small query bug: message page server query uses `display_order` on `product_images`, but the column is `sort_order`.
  - RLS policies for `messages` are not present in migrations; reads/writes can fail silently.

- Core fix pillars:
  - Add the missing RPCs + indexes.
  - Add robust RLS on `messages` (and confirm related tables).
  - Fix Edge Function to align with schema and channel.
  - Normalize realtime strategy: either rely solely on Postgres changes or keep broadcast with the correct channel name.
  - Unify sending path to the Edge Function and remove duplicate server action insertion.

Outcome: legacy messages (e.g., Tintin) become visible via RPCs; sending DMs works again; unread counts and live updates work consistently.

---

## Symptoms To Reproduce

1) Open `/messages` with a user that previously exchanged messages (e.g., Tintin) → conversations/messages do not appear.
2) Try sending a DM from product page or messages → fails or does not appear for receiver.

Root causes confirmed in the code:
- apps/web/src/lib/services/ConversationService.ts: uses RPCs not present in `supabase/migrations`.
- supabase/functions/send-message/index.ts: inserts `message_type`, and broadcasts to `message-notifications` instead of the channel the client listens on.
- apps/web/src/routes/(protected)/messages/+page.server.ts: product image select uses `display_order` (should be `sort_order`).

---

## Implementation Orchestration (Step-by-Step)

Do these in order. Use staging first; verify; then promote.

1) Database: RLS + Indexes + RPCs
- Add a migration with:
  - Enable RLS on `public.messages` and policies:
    - SELECT: sender OR receiver is `auth.uid()`
    - INSERT: `sender_id = auth.uid()` and not sending to self
    - UPDATE (read state): only by the `receiver_id`
  - Indexes: `(receiver_id, is_read)`, `(sender_id, created_at)`, `(product_id)`.
  - RPC: `get_user_conversations`, `get_conversation_messages`, `mark_conversation_read` (SQL provided below).

2) Edge Function: send-message
- Remove `message_type` from insert list (column not in schema). Keep `status` if enum exists.
- Broadcast to the channel the client actually subscribes to: `user-notifications-${receiverId}` with event `message_received` and payload `{ conversation_id, message, for_user: receiverId }`.
- Optional: Add simple rate limiting (by userId per minute) to prevent abuse.

3) Realtime Strategy (choose one)
- Option A (minimal change): keep broadcast + also use Postgres changes as a safety net.
  - ConversationService currently listens to broadcast on `user-notifications-${userId}` (works after fix above).
  - RealtimeNotificationService already uses Postgres changes on `messages` (no change required).
- Option B (simplify): rely solely on Postgres changes and remove broadcast from Edge Function + ConversationService.
  - If you pick B, refactor ConversationService to subscribe to Postgres changes like RealtimeNotificationService.
  - For V1, pick Option A to minimize client code changes.

4) Server/API Cleanups
- Remove or gate the direct server action that inserts into `messages` in:
  - apps/web/src/routes/(protected)/messages/+page.server.ts:240
  - Prefer using the Edge Function sending path only (ConversationService already uses it) to centralize logic and rate-limiting.
- Fix product images query in the same file: rename `display_order` → `sort_order`.

5) Client Fixes (if needed)
- apps/web/src/lib/services/ConversationService.ts
  - Keep send path to Edge Function.
  - Keep broadcast listener as-is; after Edge Function fix it will fire for the right channel.
  - Confirm the RPC payload mapping doesn’t rely on nonexistent DB columns (e.g., `message_type`).
- apps/web/src/routes/(protected)/messages/ModularMessages.svelte
  - No code logic changes required if conversation IDs are stable as `${otherUserId}__${productId || 'general'}`.

6) Security Hardening
- Confirm `messages` RLS policies.
- Sanity-check RLS on `profiles` (own row update only) and any tables selected in RPCs.
- Ensure edge function secrets set: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

7) Observability
- Add structured logs to send-message with fields: `sender_id`, `receiver_id`, `product_id`, `message_id`.
- Sentry is already wired at app-level; confirm PUBLIC_SENTRY_DSN.

---

## SQL: Migrations (RLS, Indexes, RPCs)

Create a new migration under `supabase/migrations` (e.g., `20250910_messages_refactor.sql`).

RLS + Indexes
```sql
-- Messages RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT USING (
    sender_id = (SELECT auth.uid()) OR receiver_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "messages_insert_self" ON public.messages;
CREATE POLICY "messages_insert_self" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = (SELECT auth.uid()) AND receiver_id <> (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "messages_update_read_by_receiver" ON public.messages;
CREATE POLICY "messages_update_read_by_receiver" ON public.messages
  FOR UPDATE USING (
    receiver_id = (SELECT auth.uid())
  ) WITH CHECK (
    receiver_id = (SELECT auth.uid())
  );

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_messages_receiver_isread ON public.messages(receiver_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON public.messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_product ON public.messages(product_id);
```

RPC: get_user_conversations
```sql
CREATE OR REPLACE FUNCTION public.get_user_conversations(
  p_user_id uuid,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  conversation_id text,
  other_user_id uuid,
  other_user_name text,
  other_user_avatar text,
  other_user_last_active timestamptz,
  product_id uuid,
  product_title text,
  product_price numeric,
  product_image text,
  order_id uuid,
  order_status text,
  order_total numeric,
  last_message text,
  last_message_time timestamptz,
  unread_count int,
  is_product_conversation boolean
)
LANGUAGE sql STABLE AS $$
  WITH msgs AS (
    SELECT
      m.*,
      CASE WHEN m.sender_id = p_user_id THEN m.receiver_id ELSE m.sender_id END AS other_id,
      COALESCE(m.product_id, '00000000-0000-0000-0000-000000000000'::uuid) AS pid
    FROM public.messages m
    WHERE m.sender_id = p_user_id OR m.receiver_id = p_user_id
  ), last_msg AS (
    SELECT DISTINCT ON (other_id, pid)
      other_id, pid, id AS message_id, content AS last_message, created_at AS last_message_time
    FROM msgs
    ORDER BY other_id, pid, created_at DESC
  ), unread AS (
    SELECT other_id, pid, COUNT(*)::int AS unread_count
    FROM msgs
    WHERE receiver_id = p_user_id AND is_read IS NOT TRUE
    GROUP BY other_id, pid
  )
  SELECT
    (other_id::text || '__' || CASE WHEN pid = '00000000-0000-0000-0000-000000000000'::uuid THEN 'general' ELSE pid::text END) AS conversation_id,
    other_id AS other_user_id,
    COALESCE(p.username, p.full_name, 'User') AS other_user_name,
    p.avatar_url AS other_user_avatar,
    p.last_active_at AS other_user_last_active,
    NULLIF(pid, '00000000-0000-0000-0000-000000000000'::uuid) AS product_id,
    pr.title AS product_title,
    pr.price AS product_price,
    (SELECT pi.image_url FROM public.product_images pi WHERE pi.product_id = pr.id ORDER BY pi.sort_order NULLS LAST LIMIT 1) AS product_image,
    NULL::uuid AS order_id,
    NULL::text AS order_status,
    NULL::numeric AS order_total,
    lm.last_message,
    lm.last_message_time,
    COALESCE(u.unread_count, 0) AS unread_count,
    (NULLIF(pid, '00000000-0000-0000-0000-000000000000'::uuid) IS NOT NULL) AS is_product_conversation
  FROM last_msg lm
  LEFT JOIN public.profiles p ON p.id = lm.other_id
  LEFT JOIN public.products pr ON pr.id = NULLIF(lm.pid, '00000000-0000-0000-0000-000000000000'::uuid)
  LEFT JOIN unread u ON u.other_id = lm.other_id AND u.pid = lm.pid
  ORDER BY lm.last_message_time DESC
  LIMIT GREATEST(p_limit, 1);
$$;
```

RPC: get_conversation_messages
```sql
CREATE OR REPLACE FUNCTION public.get_conversation_messages(
  p_user_id uuid,
  p_other_user_id uuid,
  p_product_id uuid DEFAULT NULL,
  p_before_time timestamptz DEFAULT NULL,
  p_limit integer DEFAULT 30
)
RETURNS TABLE (
  id uuid,
  sender_id uuid,
  receiver_id uuid,
  product_id uuid,
  order_id uuid,
  content text,
  created_at timestamptz,
  is_read boolean,
  status text,
  delivered_at timestamptz,
  read_at timestamptz,
  sender_info jsonb,
  receiver_info jsonb,
  order_info jsonb
)
LANGUAGE sql STABLE AS $$
  SELECT
    m.id, m.sender_id, m.receiver_id, m.product_id, m.order_id, m.content, m.created_at,
    m.is_read, m.status::text, m.delivered_at, m.read_at,
    to_jsonb(ps.*) - 'payout_method' - 'payout_settings' AS sender_info,
    to_jsonb(pr.*) - 'payout_method' - 'payout_settings' AS receiver_info,
    NULL::jsonb AS order_info
  FROM public.messages m
  JOIN public.profiles ps ON ps.id = m.sender_id
  JOIN public.profiles pr ON pr.id = m.receiver_id
  WHERE (
    (m.sender_id = p_user_id AND m.receiver_id = p_other_user_id)
    OR (m.sender_id = p_other_user_id AND m.receiver_id = p_user_id)
  )
  AND (
    (p_product_id IS NULL AND m.product_id IS NULL)
    OR (p_product_id IS NOT NULL AND m.product_id = p_product_id)
  )
  AND (p_before_time IS NULL OR m.created_at < p_before_time)
  ORDER BY m.created_at DESC
  LIMIT GREATEST(p_limit, 1);
$$;
```

RPC: mark_conversation_read
```sql
CREATE OR REPLACE FUNCTION public.mark_conversation_read(
  p_user_id uuid,
  p_other_user_id uuid,
  p_product_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.messages
  SET is_read = TRUE, read_at = NOW()
  WHERE receiver_id = p_user_id
    AND sender_id = p_other_user_id
    AND (
      (p_product_id IS NULL AND product_id IS NULL)
      OR (p_product_id IS NOT NULL AND product_id = p_product_id)
    )
    AND is_read IS DISTINCT FROM TRUE;
END;
$$;
```

> Note: All RPCs implicitly benefit from RLS. Ensure the RLS policies above are in place first.

---

## Edge Function: send-message (Fixes)

File: `supabase/functions/send-message/index.ts`

Required code changes:
1) Remove `message_type` from insert payload and select list.
2) Set broadcast channel to `user-notifications-${receiverId}` and event `message_received` to match the client.
3) Optional: implement a simple in-memory rate limit (e.g., 60 messages/hour/user) to reduce abuse.

Pseudo-diff (reference):
```ts
// Insert message (no message_type)
const { data: message, error: insertError } = await supabaseAdmin
  .from('messages')
  .insert({
    sender_id: user.id,
    receiver_id: receiverId,
    product_id: productId || null,
    order_id: orderId || null,
    content: content.trim(),
    status: 'sent'
  })
  .select(`
    id, sender_id, receiver_id, product_id, order_id, content, created_at, status,
    sender:profiles!sender_id (id, username, full_name, avatar_url)
  `)
  .single();

// Broadcast to the correct channel
await supabaseAdmin
  .channel(`user-notifications-${receiverId}`)
  .send({
    type: 'broadcast',
    event: 'message_received',
    payload: { conversation_id: conversationId, message, for_user: receiverId }
  });
```

---

## Server/API Fixes

File: `apps/web/src/routes/(protected)/messages/+page.server.ts`

- Replace `display_order` with `sort_order` in the product images nested select to match schema.
- Remove or comment the `actions.sendMessage` direct insert and rely on the Edge Function path used by `ConversationService`.

---

## Validation Plan

1) Show historic messages (e.g., Tintin)
  - Get Tintin’s user id: `select id from profiles where username ilike 'tintin' limit 1;`
  - Call `get_user_conversations(p_user_id => <tintin_id>)` in SQL editor → expect non-empty.
  - Open `/messages` as Tintin → UI lists conversations; select one → messages load.

2) Send/Receive DM
  - User A → User B (general) and for a product.
  - Receiver sees realtime update (broadcast event or Postgres changes) and unread counts increment; opening marks read.

3) Edge cases
  - Self-send blocked.
  - Pagination: scroll up loads older messages via `get_conversation_messages` with `p_before_time`.
  - Unread count reflects `mark_conversation_read` calls.

4) Security
  - RLS: third user cannot read others’ messages.
  - Edge function requires valid JWT; missing/invalid Authorization returns 401.

---

## Rollout Checklist

- [ ] Apply migration to staging; ensure RLS + RPCs + indexes in place.
- [ ] Patch and deploy Edge Function.
- [ ] Verify realtime flows (broadcast channel) and UI updates.
- [ ] Run e2e tests in `apps/web/tests/messages.spec.ts` and smoke flows.
- [ ] Promote to production.

---

## File Pointers (for claude-code)

- Conversation service and UI
  - `apps/web/src/lib/services/ConversationService.ts:1`
  - `apps/web/src/routes/(protected)/messages/ModularMessages.svelte:1`
  - `apps/web/src/lib/components/modular/ChatWindow.svelte:1`

- Server/page
  - `apps/web/src/routes/(protected)/messages/+page.server.ts:1`

- Edge function
  - `supabase/functions/send-message/index.ts:1`

- Types (confirm schema columns)
  - `apps/web/src/lib/types/supabase.ts:640`

---

## Optional Simplifications (Post-V1)

- Remove broadcast and standardize on Postgres changes for all message realtime.
- Add a `conversations` materialized view for faster conversation list queries.
- Add blocks/reporting to prevent abusive DMs.

