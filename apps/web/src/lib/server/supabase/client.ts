// Centralized browser client lives in $lib/supabase/client.ts
// Re-export to maintain legacy import path compatibility without duplication.
export { createBrowserSupabaseClient } from '$lib/supabase/client';