import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

// Use static environment variables for server-only code

if (!STRIPE_SECRET_KEY) {
	console.warn('STRIPE_SECRET_KEY not available - Stripe functionality disabled');
}

export const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2024-12-18.acacia'
}) : null;

export type { Stripe };