# Supabase Cleanup & Policy Audit Plan (MCP-Ready)

Use this with Claude-Code (Supabase MCP). Execute read-only audits first; stage changes separately and await approval before applying.

## 0) Context Capture
- Project: confirm project ID and environments (staging/prod URLs)
- Auth: confirm providers enabled, email templates, redirect URLs
- Cookies: ensure session cookie `path: '/'`, domain matches app domains

Prompt — Capture Settings
"""
List auth settings, redirect URLs, cookie configuration, and JWT expiry/refresh intervals. Export to `reference/supabase_settings.json` and attach here.
"""

## 1) RLS Status & Policy Inventory
Tables: `products`, `categories`, `users`, `profiles`, `orders`, `order_items`, `favorites`

Prompt — Audit RLS & Policies
"""
For each listed table, output:
- RLS enabled? (true/false)
- Existing policies (name, command, using, check)
- Owner column (if applicable)
- Suggested gaps
"""

## 2) Standard Policy Templates (Propose Only)
Use these as templates; replace table/columns accordingly.

Read (Anon) Example
```sql
create policy "read_public_products"
  on public.products for select
  to anon
  using (published = true);
```

Owner Write Example
```sql
create policy "write_own_rows"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "update_own_rows"
  on public.orders for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Favorites Scoped Example
```sql
create policy "favorites_read_own"
  on public.favorites for select
  to authenticated
  using (auth.uid() = user_id);

create policy "favorites_write_own"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);
```

Prompt — Propose SQL Fixes
"""
Based on the audit, generate SQL blocks to:
- Enable RLS where missing
- Add read policies for public data (products/categories)
- Add owner-scoped read/write for private data (orders/order_items/favorites/profiles)
- Revoke overly-broad policies
Do not apply yet; output SQL in separate fenced blocks.
"""

## 3) Apply Changes (After Approval)
Prompt — Apply Policies
"""
Apply the approved SQL blocks. Then re-run policy inventory for verification and attach the before/after diff.
"""

## 4) Performance & Indexes (Optional)
Prompt — Index Suggestions
"""
Based on top queries (products list, featured, by-category, favorites by user), suggest indexes. Output `CREATE INDEX` statements and expected selectivity. Do not apply without approval.
"""

## 5) Export Changes
- Save final SQL scripts under `supabase/policies/DATE.sql`
- Update `SUPABASE_POLICIES.sql` with canonical state

Checklist
- [ ] Settings captured
- [ ] RLS/policies audited
- [ ] SQL fixes proposed
- [ ] Fixes applied and verified
- [ ] Index suggestions proposed
- [ ] Changes exported
