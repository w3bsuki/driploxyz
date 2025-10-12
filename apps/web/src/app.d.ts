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
	export const PUBLIC_SITE_URL: string;
}

// Module declarations are in @repo/i18n/src/types.d.ts

export {};
