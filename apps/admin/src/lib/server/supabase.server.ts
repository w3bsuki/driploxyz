import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

export const createServiceClient = () => {
  const SUPABASE_SERVICE_ROLE_KEY = privateEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!env.PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase service role environment variables not configured');
  }

  return createServerClient(
    env.PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {}
      }
    }
  );
};

export const supabaseServiceClient = createServiceClient();
