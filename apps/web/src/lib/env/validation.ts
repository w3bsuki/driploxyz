import { building } from '$app/environment';
import { env as dynamicPublicEnv } from '$env/dynamic/public';
import {
  PUBLIC_SUPABASE_ANON_KEY as staticSupabaseAnonKey,
  PUBLIC_SUPABASE_URL as staticSupabaseUrl,
  PUBLIC_STRIPE_PUBLISHABLE_KEY as staticStripeKey
} from '$env/static/public';
import { z } from 'zod';

const publicEnvSchema = z.object({
  PUBLIC_SUPABASE_URL: z.string().url({ message: 'PUBLIC_SUPABASE_URL must be a valid URL' }),
  PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'PUBLIC_SUPABASE_ANON_KEY is required'),
  PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional()
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
  RATE_LIMIT_SECRET: z.string().min(32).optional(),
  CSRF_SECRET: z.string().min(32).optional(),
  RESEND_API_KEY: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  GOOGLE_ANALYTICS_ID: z.string().startsWith('G-').optional(),
  MIXPANEL_TOKEN: z.string().optional(),
  CLOUDINARY_URL: z.string().url().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional()
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type Env = PublicEnv & ServerEnv;

const processEnv = typeof process !== 'undefined' ? process.env : {};

function pickValue(...candidates: Array<string | undefined | null>): string | undefined {
  for (const value of candidates) {
    if (value && value.length > 0) {
      return value;
    }
  }
  return undefined;
}

function resolvePublicEnv() {
  return {
    PUBLIC_SUPABASE_URL: pickValue(staticSupabaseUrl, dynamicPublicEnv.PUBLIC_SUPABASE_URL, processEnv.PUBLIC_SUPABASE_URL),
    PUBLIC_SUPABASE_ANON_KEY: pickValue(
      staticSupabaseAnonKey,
      dynamicPublicEnv.PUBLIC_SUPABASE_ANON_KEY,
      processEnv.PUBLIC_SUPABASE_ANON_KEY
    ),
    PUBLIC_STRIPE_PUBLISHABLE_KEY: pickValue(staticStripeKey, dynamicPublicEnv.PUBLIC_STRIPE_PUBLISHABLE_KEY)
  } satisfies Record<keyof PublicEnv, string | undefined>;
}

function resolveServerEnv() {
  return {
    SUPABASE_SERVICE_ROLE_KEY: pickValue(processEnv.SUPABASE_SERVICE_ROLE_KEY),
    STRIPE_SECRET_KEY: pickValue(processEnv.STRIPE_SECRET_KEY),
    STRIPE_WEBHOOK_SECRET: pickValue(processEnv.STRIPE_WEBHOOK_SECRET),
    RATE_LIMIT_SECRET: pickValue(processEnv.RATE_LIMIT_SECRET),
    CSRF_SECRET: pickValue(processEnv.CSRF_SECRET),
    RESEND_API_KEY: pickValue(processEnv.RESEND_API_KEY),
    SENDGRID_API_KEY: pickValue(processEnv.SENDGRID_API_KEY),
    SENTRY_DSN: pickValue(processEnv.SENTRY_DSN),
    SENTRY_AUTH_TOKEN: pickValue(processEnv.SENTRY_AUTH_TOKEN),
    GOOGLE_ANALYTICS_ID: pickValue(processEnv.GOOGLE_ANALYTICS_ID),
    MIXPANEL_TOKEN: pickValue(processEnv.MIXPANEL_TOKEN),
    CLOUDINARY_URL: pickValue(processEnv.CLOUDINARY_URL),
    AWS_S3_BUCKET: pickValue(processEnv.AWS_S3_BUCKET),
    AWS_ACCESS_KEY_ID: pickValue(processEnv.AWS_ACCESS_KEY_ID),
    AWS_SECRET_ACCESS_KEY: pickValue(processEnv.AWS_SECRET_ACCESS_KEY),
    NODE_ENV: pickValue(processEnv.NODE_ENV) ?? 'development',
    VERCEL_ENV: pickValue(processEnv.VERCEL_ENV)
  } satisfies Record<keyof ServerEnv, string | undefined>;
}

let publicEnvCache: PublicEnv | null = null;
let serverEnvCache: ServerEnv | null = null;

export function validatePublicEnv(): PublicEnv {
  if (publicEnvCache) {
    return publicEnvCache;
  }

  try {
    const parsed = publicEnvSchema.parse(resolvePublicEnv());
    publicEnvCache = parsed;
    return parsed;
  } catch (error) {
    if (building) {
      return {
        PUBLIC_SUPABASE_URL: '',
        PUBLIC_SUPABASE_ANON_KEY: '',
        PUBLIC_STRIPE_PUBLISHABLE_KEY: undefined
      } as PublicEnv;
    }
    throw error;
  }
}

export function validateServerEnv(): ServerEnv {
  if (serverEnvCache) {
    return serverEnvCache;
  }

  if (typeof window !== 'undefined') {
    throw new Error('validateServerEnv can only be used on the server.');
  }

  const parsed = serverEnvSchema.parse(resolveServerEnv());
  serverEnvCache = parsed;
  return parsed;
}

export function validateEnv(): Env {
  const publicEnv = validatePublicEnv();
  const serverEnv = typeof window === 'undefined' ? validateServerEnv() : ({} as ServerEnv);

  if (serverEnv.NODE_ENV === 'production') {
    if (!serverEnv.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required in production');
    }
  }

  return {
    ...publicEnv,
    ...serverEnv
  };
}

export function isProduction(): boolean {
  const serverEnv = typeof window === 'undefined' ? validateServerEnv() : undefined;
  return (serverEnv?.NODE_ENV ?? processEnv.NODE_ENV) === 'production';
}

export function isDevelopment(): boolean {
  const serverEnv = typeof window === 'undefined' ? validateServerEnv() : undefined;
  const nodeEnv = serverEnv?.NODE_ENV ?? processEnv.NODE_ENV;
  return nodeEnv === 'development' || nodeEnv === undefined;
}

export function getClientEnv(): PublicEnv {
  return validatePublicEnv();
}

export const env = building ? ({} as Env) : validateEnv();
