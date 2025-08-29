import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

// Use dynamic env for better compatibility with Vercel
const STRIPE_SECRET_KEY = env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
	console.warn('STRIPE_SECRET_KEY not available - Stripe functionality disabled');
}

// Use a stable, valid Stripe API version. If omitted, Stripe defaults to the
// account's default API version. Pinning avoids unexpected behavior changes.
export const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil'
    })
  : null;

export type { Stripe };
