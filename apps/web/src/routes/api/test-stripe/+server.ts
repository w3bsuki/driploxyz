import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import Stripe from 'stripe';

export const GET: RequestHandler = async () => {
  try {
    console.log('[Test Stripe] Testing Stripe configuration');
    
    // Test 1: Environment variable
    const hasStripeKey = !!STRIPE_SECRET_KEY;
    console.log('[Test Stripe] Stripe key available:', hasStripeKey);
    
    if (!hasStripeKey) {
      return json({
        success: false,
        error: 'STRIPE_SECRET_KEY not available',
        tests: { envVar: false }
      });
    }
    
    // Test 2: Initialize Stripe
    let stripeInstance: Stripe | null = null;
    try {
      stripeInstance = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2025-07-30.basil'
      });
      console.log('[Test Stripe] Stripe instance created successfully');
    } catch (error) {
      console.error('[Test Stripe] Failed to create Stripe instance:', error);
      return json({
        success: false,
        error: 'Failed to create Stripe instance',
        details: error instanceof Error ? error.message : 'Unknown error',
        tests: { envVar: true, stripeInit: false }
      });
    }
    
    // Test 3: Try a simple Stripe API call
    try {
      const customers = await stripeInstance.customers.list({ limit: 1 });
      console.log('[Test Stripe] Stripe API call successful');
      
      return json({
        success: true,
        message: 'Stripe is working correctly',
        tests: {
          envVar: true,
          stripeInit: true,
          apiCall: true
        },
        customerCount: customers.data.length
      });
    } catch (error) {
      console.error('[Test Stripe] Stripe API call failed:', error);
      return json({
        success: false,
        error: 'Stripe API call failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        tests: {
          envVar: true,
          stripeInit: true,
          apiCall: false
        }
      });
    }
    
  } catch (error) {
    console.error('[Test Stripe] Unexpected error:', error);
    return json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};