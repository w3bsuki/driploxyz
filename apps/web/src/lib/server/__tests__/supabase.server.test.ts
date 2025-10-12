import { describe, it, expect, beforeEach, vi } from 'vitest';

const createServerClientMock = vi.fn(() => ({ client: true }));
const publicEnv = { PUBLIC_SUPABASE_URL: undefined as string | undefined };
const privateEnv = { SUPABASE_SERVICE_ROLE_KEY: undefined as string | undefined };

vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientMock
}));

vi.mock('$env/dynamic/public', () => ({
  env: publicEnv
}));

vi.mock('$env/dynamic/private', () => ({
  env: privateEnv
}));

async function loadModule() {
  return import('../supabase.server');
}

describe('service role client helpers', () => {
  beforeEach(() => {
    createServerClientMock.mockClear();
    publicEnv.PUBLIC_SUPABASE_URL = undefined;
    privateEnv.SUPABASE_SERVICE_ROLE_KEY = undefined;
    vi.resetModules();
  });

  it('returns null when service role is not configured and not required', async () => {
    const { createServiceClient, hasServiceRoleAccess } = await loadModule();

    expect(hasServiceRoleAccess()).toBe(false);
    expect(createServiceClient({ required: false })).toBeNull();
    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it('throws when service role is required but missing', async () => {
    const { createServiceClient, ServiceRoleUnavailableError } = await loadModule();

    expect(() => createServiceClient()).toThrow(ServiceRoleUnavailableError);
    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it('creates a Supabase client when credentials are available', async () => {
    publicEnv.PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    privateEnv.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

    const { createServiceClient, hasServiceRoleAccess, requireServiceClient } = await loadModule();

    expect(hasServiceRoleAccess()).toBe(true);

    const optionalClient = createServiceClient({ required: false });
    expect(optionalClient).toEqual({ client: true });

    const requiredClient = requireServiceClient();
    expect(requiredClient).toEqual({ client: true });
    expect(createServerClientMock).toHaveBeenCalledTimes(2);
    expect(createServerClientMock).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'service-role-key',
      expect.objectContaining({ cookies: expect.any(Object) })
    );
  });
});
