import { afterEach, describe, expect, it, vi } from 'vitest';

const environmentState = { browser: false };
const privateEnvironment = { SUPABASE_SERVICE_ROLE_KEY: undefined as string | undefined };
const publicEnvironment = { PUBLIC_SUPABASE_URL: 'https://example.supabase.co' };

vi.mock('$app/environment', () => ({
  get browser() {
    return environmentState.browser;
  },
  get building() {
    return false;
  },
  get dev() {
    return false;
  }
}));

vi.mock('$env/dynamic/private', () => ({
  get env() {
    return privateEnvironment;
  }
}));

vi.mock('$env/dynamic/public', () => ({
  get env() {
    return publicEnvironment;
  }
}));

vi.mock('$env/static/public', () => ({
  get PUBLIC_SUPABASE_URL() {
    return publicEnvironment.PUBLIC_SUPABASE_URL;
  }
}));

const serviceRole = await import('../supabase-service-role');

const { hasServiceRoleKey, getServiceRoleConfig, requireServiceRoleConfig } = serviceRole;

afterEach(() => {
  environmentState.browser = false;
  privateEnvironment.SUPABASE_SERVICE_ROLE_KEY = undefined;
  publicEnvironment.PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
});

describe('supabase service role helpers', () => {
  it('reports missing service role key', () => {
    expect(hasServiceRoleKey()).toBe(false);
    expect(getServiceRoleConfig()).toBeNull();
  });

  it('detects configured service role key', () => {
    privateEnvironment.SUPABASE_SERVICE_ROLE_KEY = 'service-role-secret';

    expect(hasServiceRoleKey()).toBe(true);

    const config = getServiceRoleConfig();
    expect(config).not.toBeNull();
    expect(config?.serviceRoleKey).toBe('service-role-secret');
    expect(config?.supabaseUrl).toBe('https://example.supabase.co');
  });

  it('throws when service role key is missing', () => {
    expect(() => requireServiceRoleConfig()).toThrow(/not configured/i);
  });

  it('throws when called in browser context', () => {
    environmentState.browser = true;
    privateEnvironment.SUPABASE_SERVICE_ROLE_KEY = 'service-role-secret';

    expect(() => requireServiceRoleConfig()).toThrow(/browser/i);
  });

  it('throws when supabase url is missing', () => {
    privateEnvironment.SUPABASE_SERVICE_ROLE_KEY = 'service-role-secret';
    publicEnvironment.PUBLIC_SUPABASE_URL = '';

    expect(() => requireServiceRoleConfig()).toThrow(/PUBLIC_SUPABASE_URL/i);
  });
});
