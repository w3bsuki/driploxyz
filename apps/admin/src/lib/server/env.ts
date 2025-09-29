import { building, dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';

const requiredEnvVars = [
  'PUBLIC_SUPABASE_URL',
  'PUBLIC_SUPABASE_ANON_KEY'
] as const;

export function validateEnvironment(): void {
  if (!building && !dev) {
    requiredEnvVars.forEach((envVar) => {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    });

    if (!process.env['SUPABASE_SERVICE_ROLE_KEY']) {
      // Optional - admin features will be limited without the service role key
    }
  }
}

export function setupEnvironment(_event: RequestEvent): void {}

validateEnvironment();
