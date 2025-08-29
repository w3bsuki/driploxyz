/**
 * SvelteKit Server Hooks - Modular Architecture
 * 
 * This file provides a clean, maintainable orchestration layer for server-side request handling.
 * All complex logic has been extracted into focused, reusable modules in lib/server/.
 * 
 * Architecture:
 * - Environment validation: lib/server/env.ts
 * - Authentication: lib/server/supabase-hooks.ts, lib/server/auth-guard.ts
 * - Internationalization: lib/server/i18n.ts
 * - Error handling: lib/server/error-handler.ts
 * - Monitoring: lib/server/sentry.ts
 * - Utilities: lib/server/utils.ts
 */

// Export the modular handles and error handler
export { handle, handleError } from '$lib/server/hooks';
