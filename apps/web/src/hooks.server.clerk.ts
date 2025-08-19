import { handleClerk } from 'clerk-sveltekit/server';
import { CLERK_SECRET_KEY } from '$env/static/private';
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { createSupabaseClientWithClerk } from '$lib/supabase/clerk-client';

const clerkHandle = handleClerk({
  secretKey: CLERK_SECRET_KEY,
  publishableKey: PUBLIC_CLERK_PUBLISHABLE_KEY,
  debug: true
});

const supabaseHandle: Handle = async ({ event, resolve }) => {
  // Get the Clerk session if available
  const session = await event.locals.getSession?.();
  
  if (session) {
    // Create Supabase client with Clerk token
    event.locals.supabase = createSupabaseClientWithClerk(
      async () => await session.getToken({ template: 'supabase' })
    );
  }
  
  return resolve(event);
};

export const handle = sequence(clerkHandle, supabaseHandle);