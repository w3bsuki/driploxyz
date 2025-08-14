import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

const stripeSecretKey = env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
	throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(stripeSecretKey, {
	apiVersion: '2024-12-18.acacia'
});

export type { Stripe };