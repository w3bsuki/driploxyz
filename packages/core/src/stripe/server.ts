import Stripe from 'stripe';

// Use dynamic env for better compatibility with Vercel
const STRIPE_SECRET_KEY = typeof process !== 'undefined' ? process.env.STRIPE_SECRET_KEY : null;

if (!STRIPE_SECRET_KEY) {
	// Stripe will be disabled if no secret key is provided
}

// Use a stable, valid Stripe API version. If omitted, Stripe defaults to the
// account's default API version. Pinning avoids unexpected behavior changes.
export const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil'
    })
  : null;

export type { Stripe };
