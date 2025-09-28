# Supabase Schema Snapshot

_No live snapshot available in this environment._

## Known Gaps
- `order_items` table referenced in Stripe service is missing from generated types.
- RPC functions used by messaging (`get_user_conversations`, `get_conversation_messages`, `mark_conversation_read`) are absent.
- `user_payments`, `user_subscriptions`, and related tables referenced in comments need confirmation.

## Next Steps
1. Pull latest schema using `supabase gen types typescript --linked > packages/database/src/generated.ts`.
2. Record table/RPC inventory here once snapshot is captured.
3. Highlight any destructive migrations requiring manual confirmation before execution.
