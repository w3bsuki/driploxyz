import Stripe from 'stripe';
// Framework-agnostic environment access

let stripeInstance: Stripe | null = null;

export const stripe = stripeInstance;

// TODO: Initialize Stripe with proper secret key from environment
// stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-06-20',
// });