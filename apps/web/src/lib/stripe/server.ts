import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

const stripeSecretKey = STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
	throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(stripeSecretKey, {
	apiVersion: '2024-12-18.acacia'
});

export type { Stripe };