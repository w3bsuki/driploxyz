import { SupabaseClient } from '@supabase/supabase-js';
import { stripe } from '../stripe/server';
import { createEmailService } from '../email';

export interface ServiceContainer {
	supabase: SupabaseClient;
	stripe: typeof stripe;
	email: ReturnType<typeof createEmailService>;
}

export function createServices(supabase: SupabaseClient): ServiceContainer {
	return {
		supabase,
		stripe,
		email: createEmailService()
	};
}