import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import type { CountryCode } from '$lib/country/detection';
import type { LanguageTag } from '@repo/i18n';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}
		interface Locals {
			supabase: SupabaseClient<Database>;
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
			country: CountryCode;
			locale: LanguageTag;
			cspNonce?: string;
		}
		interface PageData {
			session: Session | null;
			user: User | null;
			country?: CountryCode;
			locale?: LanguageTag;
		}
		// interface Platform {}
	}
}

declare module '$env/static/public' {
        export const PUBLIC_SUPABASE_URL: string;
        export const PUBLIC_SUPABASE_ANON_KEY: string;
        export const PUBLIC_STRIPE_PUBLISHABLE_KEY: string | undefined;
        export const PUBLIC_SENTRY_DSN: string | undefined;
        export const PUBLIC_SITE_URL: string | undefined;
}

declare module '$env/static/private' {
        export const SUPABASE_SERVICE_ROLE_KEY: string | undefined;
        export const STRIPE_SECRET_KEY: string | undefined;
        export const STRIPE_WEBHOOK_SECRET: string | undefined;
        export const RATE_LIMIT_SECRET: string | undefined;
        export const RESEND_API_KEY: string | undefined;
        export const SENTRY_DSN: string | undefined;
        export const SENTRY_AUTH_TOKEN: string | undefined;
        export const SENTRY_RELEASE: string | undefined;
        export const SENTRY_PROJECT: string | undefined;
        export const SENTRY_ORG: string | undefined;
}

// Module declarations are in @repo/i18n/src/types.d.ts

export {};
