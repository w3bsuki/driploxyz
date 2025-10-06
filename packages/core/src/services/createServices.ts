import { SupabaseClient } from '@supabase/supabase-js';
import { Stripe } from 'stripe';
import { createStripeService } from './stripe';
import { createEmailService } from '../email';

export interface ServiceContainer {
	supabase: SupabaseClient;
	stripe: ReturnType<typeof createStripeService>;
	email: ReturnType<typeof createEmailService>;
}

export function createServices(supabase: SupabaseClient, stripe: Stripe): ServiceContainer {
	return {
		supabase,
		stripe: createStripeService(supabase, stripe),
		email: createEmailService()
	};
}