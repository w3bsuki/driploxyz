import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { stripe } from '$lib/stripe/server.js';
import { STRIPE_SECRET_KEY } from '$env/static/private';

export const GET: RequestHandler = async () => {
  return json({
    stripe_available: !!stripe,
    stripe_secret_key_available: !!STRIPE_SECRET_KEY,
    stripe_secret_key_prefix: STRIPE_SECRET_KEY ? STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'null',
    stripe_instance_type: typeof stripe
  });
};