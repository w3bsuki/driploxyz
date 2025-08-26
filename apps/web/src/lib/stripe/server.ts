import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '$env/static/private';

if (!STRIPE_SECRET_KEY) {
	console.warn('STRIPE_SECRET_KEY not available - Stripe functionality disabled');
}

export const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2025-07-30.basil'
}) : null;

export type { Stripe };