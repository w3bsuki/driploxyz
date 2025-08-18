import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

// Use dynamic environment variables to avoid build-time requirement
const stripeSecretKey = env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
	console.warn('STRIPE_SECRET_KEY not available - Stripe functionality disabled');
}

export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
	apiVersion: '2024-12-18.acacia'
}) : null;

export type { Stripe };