import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import { env } from '$env/dynamic/private';

// Use static env first, fallback to dynamic env for compatibility
const stripeKey = STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY;

if (!stripeKey) {
	console.warn('STRIPE_SECRET_KEY not available - Stripe functionality disabled');
}

export const stripe = stripeKey ? new Stripe(stripeKey, {
	apiVersion: '2025-07-30.basil'
}) : null;

export type { Stripe };