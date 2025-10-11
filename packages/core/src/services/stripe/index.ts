import Stripe from 'stripe';

export class StripeService {
  private stripe: Stripe;

  constructor(secretKeyOrInstance: string | Stripe) {
    if (typeof secretKeyOrInstance === 'string') {
      this.stripe = new Stripe(secretKeyOrInstance, {
        apiVersion: '2025-07-30.basil',
      });
    } else {
      this.stripe = secretKeyOrInstance;
    }
  }

  async createSimplePaymentIntent(amount: number, currency: string = 'eur'): Promise<{ clientSecret: string; error?: any }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return { clientSecret: paymentIntent.client_secret || '' };
    } catch (error) {
      return { clientSecret: '', error };
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<{ paymentIntent: any; error?: any }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return { paymentIntent };
    } catch (error) {
      return { paymentIntent: null, error };
    }
  }

  async createCustomer(userId: string, email: string): Promise<{ customerId: string; error?: any }> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      });

      return { customerId: customer.id };
    } catch (error) {
      return { customerId: '', error };
    }
  }

  async createSubscription(customerId: string, priceId: string): Promise<{ subscriptionId: string; clientSecret: string; error?: any }> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      const latestInvoice = subscription.latest_invoice as any;
      const clientSecret = latestInvoice?.payment_intent?.client_secret || '';

      return {
        subscriptionId: subscription.id,
        clientSecret,
      };
    } catch (error) {
      return { subscriptionId: '', clientSecret: '', error };
    }
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    productId: string;
    sellerId: string;
    buyerId: string;
    userEmail: string;
    metadata?: Record<string, string>;
  }): Promise<{ paymentIntent: any; clientSecret: string; error?: any }> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency,
        metadata: {
          productId: params.productId,
          sellerId: params.sellerId,
          buyerId: params.buyerId,
          userEmail: params.userEmail,
          ...params.metadata
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        paymentIntent,
        clientSecret: paymentIntent.client_secret || '',
      };
    } catch (error) {
      return { paymentIntent: null, clientSecret: '', error };
    }
  }
}

export * from './types';

export function createStripeService(stripeInstance: Stripe): StripeService {
  return new StripeService(stripeInstance);
}