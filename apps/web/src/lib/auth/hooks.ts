/**
 * CONSOLIDATED AUTH HOOKS
 *
 * Clean, efficient auth handling for SvelteKit hooks.
 * Replaces the complex, fragmented hook system with simple, fast auth.
 */

import type { RequestEvent } from '@sveltejs/kit';
import { createServerSupabase, getServerSession } from './index.js';

/**
 * Set up authentication for a request event
 * This is the single auth setup function for all hooks
 */
export async function setupAuth(event: RequestEvent): Promise<void> {
  // Skip auth setup for static assets and build time
  if (isStaticRequest(event.url.pathname)) {
    return;
  }

  try {
    // Create Supabase client
    const supabase = createServerSupabase(event.cookies, event.fetch);
    event.locals.supabase = supabase;

    // Create session getter - must be an async function
    event.locals.safeGetSession = async () => await getServerSession(event);

    // For performance, only validate sessions on routes that need auth
    // Protected routes will validate in their auth guards or load functions
  } catch (error) {
    console.warn('[Auth] Setup failed:', error);
    // Don't break the app if auth setup fails
    event.locals.supabase = null as any;
    event.locals.safeGetSession = async () => ({ session: null, user: null });
  }
}

/**
 * Check if a request is for static content that doesn't need auth
 */
function isStaticRequest(pathname: string): boolean {
  // Static file extensions
  if (/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif)$/i.test(pathname)) {
    return true;
  }

  // Static paths
  const staticPaths = [
    '/_app/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/.well-known/',
    '/manifest.json'
  ];

  return staticPaths.some(path => pathname.startsWith(path));
}

/**
 * Auth guard for protecting routes
 * Use this in handle sequence to protect routes based on their ID
 */
export async function authGuard(event: RequestEvent): Promise<void> {
  const { route, url } = event;

  // Skip guard for non-protected routes
  if (!route.id?.startsWith('/(protected)') && !route.id?.startsWith('/(admin)')) {
    return;
  }

  // Skip guard for static content
  if (isStaticRequest(url.pathname)) {
    return;
  }

  try {
    // Get session for protected routes
    const { session, user } = await event.locals.safeGetSession();

    // Store in locals for use in load functions
    event.locals.session = session;
    event.locals.user = user;

    // Note: Redirects are handled in layout load functions
    // This allows for better UX with loading states
  } catch (error) {
    console.error('[Auth] Guard error:', error);
    // Set null values if validation fails
    event.locals.session = null;
    event.locals.user = null;
  }
}