import type { RequestEvent } from '@sveltejs/kit'
import { dev } from '$app/environment'

/**
 * Resolve and memoize the client IP once per request.
 * Priority: x-forwarded-for > x-real-ip > cf-connecting-ip > event.getClientAddress()
 * Falls back to 127.0.0.1 in dev if unavailable.
 */
export function getOrSetClientIp(event: RequestEvent): string {
  if (event.locals.clientIp) return event.locals.clientIp

  // Try common proxy headers first
  const xff = event.request.headers.get('x-forwarded-for')
  const fromXff = xff?.split(',')[0]?.trim()
  const headerIp =
    fromXff ||
    event.request.headers.get('x-real-ip') ||
    event.request.headers.get('cf-connecting-ip') ||
    null

  if (headerIp) {
    event.locals.clientIp = headerIp
    return headerIp
  }

  // Fallback to SvelteKit helper
  try {
    const ip = event.getClientAddress()
    event.locals.clientIp = ip
    return ip
  } catch {
    // In prerender or certain adapters, getClientAddress may be unavailable
    const fallback = dev ? '127.0.0.1' : ''
    event.locals.clientIp = fallback
    return fallback
  }
}
