import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { env } from '$env/dynamic/public';

let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
	if (!stripePromise) {
		const publishableKey = env.PUBLIC_STRIPE_PUBLISHABLE_KEY;
		if (!publishableKey) {
			
			stripePromise = Promise.resolve(null);
		} else {
			stripePromise = loadStripe(publishableKey);
		}
	}
	return stripePromise;
};