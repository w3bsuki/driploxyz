import { building, dev } from '$app/environment';
import { validateEnv, hasServiceRoleKey } from '$lib/env/validation';

let validated = false;

export function validateEnvironment(): void {
  if (building || validated) {
    return;
  }

  const env = validateEnv();

  if (!dev && !hasServiceRoleKey(env)) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not configured; service role features are disabled.');
  }

  validated = true;
}

export function setupEnvironment(): void {
  validateEnvironment();
}

validateEnvironment();
