import type { SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

// Admin-specific types
interface AdminUser extends User {
	isAdmin: boolean;
	adminLevel: 'super' | 'standard' | 'readonly';
	lastVerified: Date;
}

// See https://svelte.dev/docs/kit/types#app.d.ts
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
			isAdmin: boolean;
			adminUser: AdminUser | null;
			ipAddress: string;
		}
		interface PageData {
			session: Session | null;
			user: User | null;
			isAdmin: boolean;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
