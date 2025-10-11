// Services module exports - Framework-agnostic only
// Note: Most services have been moved to framework-specific packages
// This now only exports pure business logic utilities

import { StripeService } from './stripe';
import { SubscriptionService } from './subscriptions';
import { ProfileService } from './profiles';
import { CollectionService } from './collections';
import { TransactionService } from './transactions';
import { ProductDomainAdapter } from './ProductDomainAdapter';

// Placeholder for future framework-agnostic services
// export * from './some-pure-service';

export function createServices(supabase: any, stripe?: any) {
  return {
    stripe: stripe ? new StripeService(stripe) : null,
    subscriptions: new SubscriptionService(supabase),
    profiles: new ProfileService(supabase),
    collections: new CollectionService(supabase),
    transactions: new TransactionService(supabase),
    products: new ProductDomainAdapter(supabase)
  };
}

// Product adapter factory for server-side usage
export function getProductAdapter(locals: { supabase: any }) {
  return new ProductDomainAdapter(locals.supabase);
}

// Export service classes for direct use
export { StripeService, SubscriptionService, ProfileService, CollectionService, TransactionService, ProductDomainAdapter };