import { createServerClient } from '@supabase/ssr';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

export class ServiceRoleUnavailableError extends Error {
  constructor(message = 'Supabase service role environment variables not configured') {
    super(message);
    this.name = 'ServiceRoleUnavailableError';
  }
}

type ServiceRoleClient = ReturnType<typeof createServerClient>;

const cookieStubs = {
  get: () => undefined,
  set: () => {},
  remove: () => {}
};

function resolveCredentials(): { url: string; serviceRoleKey: string } | null {
  const url = env.PUBLIC_SUPABASE_URL;
  const serviceRoleKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
}

function instantiateClient({ url, serviceRoleKey }: { url: string; serviceRoleKey: string }): ServiceRoleClient {
  return createServerClient(url, serviceRoleKey, { cookies: cookieStubs });
}

export function hasServiceRoleAccess(): boolean {
  return resolveCredentials() !== null;
}

export function createServiceClient(options?: { required?: boolean }): ServiceRoleClient | null {
  const credentials = resolveCredentials();

  if (!credentials) {
    if (options?.required === false) {
      return null;
    }

    throw new ServiceRoleUnavailableError();
  }

  return instantiateClient(credentials);
}

export function requireServiceClient(): ServiceRoleClient {
  const client = createServiceClient();
  if (!client) {
    throw new ServiceRoleUnavailableError();
  }
  return client;
}
