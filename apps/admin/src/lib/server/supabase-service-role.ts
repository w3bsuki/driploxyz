import { browser } from '$app/environment';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

export interface ServiceRoleConfig {
  supabaseUrl: string;
  serviceRoleKey: string;
}

function resolveSupabaseUrl(): string {
  const staticUrl = PUBLIC_SUPABASE_URL;
  if (staticUrl && typeof staticUrl === 'string' && staticUrl.length > 0) {
    return staticUrl;
  }

  const dynamicUrl = publicEnv?.PUBLIC_SUPABASE_URL;
  if (dynamicUrl && dynamicUrl.length > 0) {
    return dynamicUrl;
  }

  throw new Error('PUBLIC_SUPABASE_URL is not configured');
}

export function hasServiceRoleKey(): boolean {
  if (browser) {
    return false;
  }

  const key = privateEnv?.SUPABASE_SERVICE_ROLE_KEY;
  return typeof key === 'string' && key.length > 0;
}

export function getServiceRoleConfig(): ServiceRoleConfig | null {
  if (!hasServiceRoleKey()) {
    return null;
  }

  return {
    supabaseUrl: resolveSupabaseUrl(),
    serviceRoleKey: privateEnv.SUPABASE_SERVICE_ROLE_KEY as string
  };
}

export function requireServiceRoleConfig(): ServiceRoleConfig {
  if (browser) {
    throw new Error('Service role configuration is not available in the browser');
  }

  const config = getServiceRoleConfig();
  if (!config) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  return config;
}
