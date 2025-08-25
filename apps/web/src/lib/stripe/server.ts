import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

// Use dynamic environment variables to handle missing keys gracefully
const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
	console.warn('STRIPE_SECRET_KEY not available - Stripe functionality disabled');
}

export const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2025-07-30.basil'
}) : null;

export type { Stripe };