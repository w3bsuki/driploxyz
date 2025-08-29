# Messages Refactor Plan — Production-Ready Realtime + UX

Goal: deliver a Messenger‑grade messaging experience that is reliable under production load, cleanly modular, and pleasant on mobile/desktop. This plan covers a full audit, prioritized fixes, final architecture, UX, data/Realtime changes, and rollout/testing.

## 1) Executive Summary
- Fix slow loads and broken input states by limiting initial payloads and using incremental loading (virtualized scrolling, last N render).
- Ensure Supabase Realtime is robust: filtered subscriptions, reconnection, idempotent merges, and delivery/read state.
- Clean, modular UI with sidebar + chat window; mobile‑first behavior; input always visible.
- Gate all debug logs; remove noisy console logs in production.
- Add missing DB bits (delivered_at + RPC) and validate view/RLS.

Outcome: open `/messages` fast, conversation opens instantly, 5 recent messages render first, older load on scroll, realtime inserts land reliably, and the UI never traps navigation.

## 2) Current State — Audit

### UI & Routes
- Entry page delegates to a modular component:
  - `apps/web/src/routes/(protected)/messages/+page.svelte:1` → uses `ModularMessages.svelte`.
  - `apps/web/src/routes/(protected)/messages/ModularMessages.svelte:1` implements sidebar + chat layout and events.
- Sidebar and chat are modularized:
  - `apps/web/src/lib/components/modular/ConversationSidebar.svelte:1`
  - `apps/web/src/lib/components/modular/ChatWindow.svelte:1`
- Chat input exists and supports Enter to send:
  - `apps/web/src/lib/components/modular/ChatWindow.svelte:184`

### Data Loading
- Server load limits payloads and supports conversation param:
  - `apps/web/src/routes/(protected)/messages/+page.server.ts:1`
  - Conversation view: loads 20 latest, reversed to chronological.
  - No conversation: loads latest 50 overall for building previews.
- Marks messages as read via RPC if a conversation param is present:
  - `apps/web/src/routes/(protected)/messages/+page.server.ts:120`
- Uses enriched view `messages_with_details` for sender/receiver/product JSON.

### Client Service
- Conversation aggregation + optimistic sending + realtime:
  - `apps/web/src/lib/services/ConversationService.ts:1`
  - Inserts to `public.messages` with optimistic status `sending` → `sent`.
  - Realtime channel filtered on `receiver_id=<uid>` and `sender_id=<uid>`:
    - `ConversationService.setupRealtimeSubscriptions`: `:268`
  - Debounced UI notifications to avoid excessive re‑renders.
  - Older messages API: paginated fetch of 20 prior messages per call.
  - Calls `mark_message_delivered` RPC (not present yet) silently.

### Notifications
- Local store exists to surface toast notifications + unread badge:
  - `apps/web/src/lib/stores/messageNotifications.ts:1`

### Database & Realtime
- Tables, indexes, and RLS exist; `messages_with_details` view + `mark_messages_as_read`:
  - `migrations/001_create_core_marketplace_tables.sql:116` (messages table)
  - `migrations/006_social_features.sql:52` (view) & `:100` (RPC)
- Missing `delivered_at` column and `mark_message_delivered` RPC that client references.
- Realtime subscription code is present client‑side; ensure Supabase Realtime enabled for `public.messages` (INSERT/UPDATE).

### Observed Issues (from prod reports)
- Long loads or redirect loops into `/messages` under stale cache.
- Legacy POST to `?/sendMessage` caused 405s; server action fallback exists now.
- No input field (likely due to stale bundle / older UI); current modular ChatWindow includes input.
- Noisy console logs in production.

## 3) Target Architecture

- UI layers
  - Route wrapper: +- fetch minimal server data; pass down `data`.
  - Sidebar: list of conversations, tabs (all/unread/buying/selling), unread badges.
  - ChatWindow: input, last N visible messages, IO controls (offer, photo placeholder), infinite upwards scroll.
  - Bottom nav pinned on mobile.

- Data flow
  - Server `+page.server.ts` returns only what’s needed:
    - Conversation specified: last 20 messages for that pair/product; can reduce to 10 if needed.
    - No conversation: recent 40–60 rows to construct a conversation list (previews only).
  - Client `ConversationService`:
    - In‑memory LRU cache per conversation (cap ~100–200 ids) with message id Set for dedupe.
    - Realtime filtered subscriptions on sender/receiver.
    - Optimistic insert → server insert → realtime backfill; debounced UI updates.
    - Load older API: page of 20 per request, prepend into buffer.
    - Optional IndexedDB/sessionStorage cache for last N conversations/messages for warm resumes.

- Realtime
  - Single channel `user-messages-<uid>` with two filtered listeners (`sender_id` and `receiver_id`).
  - Exponential backoff reconnection (already implemented).
  - Typing/presence as broadcast events on the same channel (non‑critical enhancement).

- DB
  - Add `delivered_at TIMESTAMPTZ` and `read_at TIMESTAMPTZ` columns to `messages`.
  - Add RPC `mark_message_delivered(message_id UUID)`; update delivered_at.
  - Keep `mark_messages_as_read(sender, product)`; extend to set `read_at` too.
  - Verify/enable RLS policies for updating delivered/read fields by the receiver.

## 4) UX Specification

- Fast initial paint
  - Sidebar and chat skeletons render immediately.
  - If `conversation` param present, ChatWindow shows last 5 messages first (render), while prefetching up to 20 in memory; earlier pages load on scroll.
  - If no `conversation`, show sidebar with previews from last message per conversation and chat placeholder.

- Input always visible
  - ChatWindow keeps input pinned; Enter sends; Shift+Enter for newline.
  - On mobile, bottom nav stays visible to escape the page.

- Message list behavior
  - Render only last 5 messages initially to avoid reflow costs.
  - Add sentinel at top to fetch previous page when near top; show subtle “Loading older …” indicator.
  - Auto‑scroll to bottom when new message arrives if user is near bottom.

- Status and badges
  - Show Sent/Delivered/Read for messages we sent, based on `delivered_at`/`is_read`.
  - Sidebar shows unread dot and count per tab.

- Error handling
  - Optimistic messages revert on insert failure with a toast; input re‑enabled.
  - Realtime failures silently retry; UI stable.

## 5) Implementation Plan

### A. Server/Data
- `+page.server.ts` adjustments
  - Ensure conversation page returns 10–20 latest rows only; keep the rest for scroll.
  - Ensure prefetch structure contains `conversationUser` and `conversationProduct` for new conversation creation.
  - Return `unreadCount` and minimal flags already present.
  - Keep form action `sendMessage` for backwards compatibility; prefer client inserts.
  - File: `apps/web/src/routes/(protected)/messages/+page.server.ts:1`

- Database migrations
  - Add columns:
    - `ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;`
    - `ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;`
  - RPCs:
    - `mark_message_delivered(p_message_id UUID)` → sets `delivered_at = now()` when `receiver_id = auth.uid()`.
    - Update `mark_messages_as_read` to also set `read_at = now()`.
  - Policies:
    - Update policy to allow receiver to `UPDATE delivered_at, is_read, read_at`.
  - Realtime:
    - Confirm Realtime enabled on `public.messages` for INSERT/UPDATE.
  - Files: `migrations/006_social_features.sql` (append) or new `007_messages_delivery_read.sql`.

### B. Client Service (ConversationService)
- Pagination & caching
  - Maintain `messageCache` Set per conversation (exists). Add LRU cap by conversation.
  - Expose `getVisibleMessages(conversationId, count = 5)` to slice the tail for render.
  - Implement `loadOlderMessages` (exists) and ensure it merges without duplication.
- Realtime
  - Keep two filtered listeners; ensure dedupe by id before add (exists).
  - On receiving a message where `receiver_id === userId`, optionally call `mark_message_delivered` (exists; ensure RPC exists).
  - Add typing/presence broadcast API (optional):
    - `.on('broadcast', { event: 'typing' }, handler)` and `.send({ type: 'broadcast', event: 'typing', payload })`.
- Logging
  - Replace raw `console.log` with a gated `logDebug(...args)` from a shared util.
- File: `apps/web/src/lib/services/ConversationService.ts:1`

### C. UI Components
- `ChatWindow.svelte`
  - Derive `visibleMessages = conversation.messages.slice(-visibleCount)`; default `visibleCount=5`.
  - Add `IntersectionObserver` or scroll threshold at top to call `onLoadOlder` (exists) to grow history.
  - Keep input pinned; send on Enter; disable during pending.
  - Use compact bubble styles and stable timestamps.
  - File: `apps/web/src/lib/components/modular/ChatWindow.svelte:1`

- `ConversationSidebar.svelte`
  - Ensure tabs filter correctly; show unread counts; keep UI lightweight and snappy.
  - File: `apps/web/src/lib/components/modular/ConversationSidebar.svelte:1`

- Route wrapper: `ModularMessages.svelte`
  - Initialize `ConversationService` with server payload.
  - Wire `onSendMessage`, `onLoadOlder`, and selection.
  - Hide sidebar on mobile when a conversation is selected; show back button.
  - File: `apps/web/src/routes/(protected)/messages/ModularMessages.svelte:1`

### D. Logging & Observability
- Add `$lib/utils/log.ts`:
  - `export const logDebug = (...args) => (dev || localStorage.debug_messages==='1') && console.log(...args);`
- Replace raw logs in `/messages` code with `logDebug`.
- Use SvelteKit `depends('messages:*')` (already present) for fine‑grained invalidation.

### E. Performance
- Avoid rendering all messages at once; render tail only, grow as needed.
- Debounce UI updates (exists) to reduce re‑renders from bursty realtime.
- Keep server payloads small: `20` for conversation, `<=50` for list; tune later.
- Optional: window virtualization for very long threads (follow‑up).

## 6) Missing DB Objects — DDL

Run as a new migration (example `007_messages_delivery_read.sql`):

```sql
-- Add delivery/read timestamps
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Delivery RPC
DROP FUNCTION IF EXISTS public.mark_message_delivered(UUID);
CREATE OR REPLACE FUNCTION public.mark_message_delivered(
  p_message_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE public.messages
  SET delivered_at = NOW()
  WHERE id = p_message_id AND receiver_id = (SELECT auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Expand read RPC to set read_at too (optional if you want timestamps)
DROP FUNCTION IF EXISTS public.mark_messages_as_read(UUID, UUID);
CREATE OR REPLACE FUNCTION public.mark_messages_as_read(
  p_sender_id UUID,
  p_product_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE v_updated INTEGER; BEGIN
  UPDATE public.messages
  SET is_read = TRUE, read_at = COALESCE(read_at, NOW())
  WHERE receiver_id = (SELECT auth.uid())
    AND sender_id = p_sender_id
    AND ((p_product_id IS NULL AND product_id IS NULL) OR (p_product_id IS NOT NULL AND product_id = p_product_id));
  GET DIAGNOSTICS v_updated = ROW_COUNT; RETURN v_updated;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS policies (receiver can mark as delivered/read)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='messages_update_delivery_and_read'
  ) THEN
    CREATE POLICY messages_update_delivery_and_read ON public.messages
      FOR UPDATE TO authenticated
      USING (receiver_id = (SELECT auth.uid()))
      WITH CHECK (true);
  END IF; END $$;
```

Checklist in Supabase dashboard:
- Realtime → Enable on `public.messages` for INSERT/UPDATE.
- Confirm RLS enabled on `public.messages`.

## 7) Cutover & Caching Strategy

- Rendering strategy
  - Render only last 5 messages on first paint (`visibleCount=5`).
  - Keep a prefetch buffer (e.g., 20) in memory so quick scrolling feels instant.
  - Grow history by 20 per `onLoadOlder` call until exhaustion.

- Client caching
  - In‑memory Map<conversationId, Conversation> with capped message arrays.
  - Optional: sessionStorage/IndexedDB snapshot of last N conversations for warm resumes.
  - Invalidate selectively when server `depends('messages:*')` keys change.

- Backwards compatibility
  - Keep server action `sendMessage` for stale clients that POST to `?/sendMessage`.
  - Prefer client inserts; realtime backfills canonical row.

- Logging
  - Remove raw `console.log` in messages code; use `logDebug` with localStorage flag.

## 8) Test & Verification Matrix

- Local dev
  - Navigate to `/messages` without param: sidebar shows; no excessive network.
  - Open `/messages?conversation=<uid>__general`: last 5 render immediately; load older works.
  - A→B send: optimistic bubble shows; B receives realtime insert within ~<300ms; unread badge increments.
  - Reload: unread updates to 0 when viewing; RPC applied.

- Failure cases
  - Insert fails (RLS): optimistic bubble removed; toast shown; input re‑enabled.
  - Realtime disconnects: reconnection backoff kicks in; messages still visible.

- Production checks
  - Supabase Realtime toggled on `public.messages`.
  - View + RPCs exist with correct ownership/SECURITY DEFINER.
  - Service Worker / Edge cache purged to avoid stale bundles.

## 9) Work Breakdown (High‑Level)

1) DB migration: delivery/read columns + RPC + policy
2) Server load tune: limits + consistent param handling
3) ConversationService: visible tail API + typing broadcast (optional)
4) ChatWindow: render last 5 + infinite scroll upwards
5) Logging cleanup: gated logs, remove noisy prints
6) Verification: local + staging runbook
7) Production rollout: cache purge, realtime validation

## 10) Notes & Risks

- Delivery/read timestamps are additive; older rows keep `NULL` until events occur.
- Stale bundles can submit legacy actions; keep server action for a few release cycles.
- Indexes are present; consider composite `(receiver_id, created_at DESC)` if inbox growth requires.
- Optional virtualization after baseline is stable.

## 11) References

- Route server: `apps/web/src/routes/(protected)/messages/+page.server.ts:1`
- Route UI: `apps/web/src/routes/(protected)/messages/ModularMessages.svelte:1`
- Sidebar: `apps/web/src/lib/components/modular/ConversationSidebar.svelte:1`
- Chat: `apps/web/src/lib/components/modular/ChatWindow.svelte:1`
- Service: `apps/web/src/lib/services/ConversationService.ts:1`
- View/RPC: `migrations/006_social_features.sql:52` (view), `:100` (RPC)

Done right: `/messages` loads instantly, shows the last five messages, older history streams in on demand, and realtime feels instant and reliable.

