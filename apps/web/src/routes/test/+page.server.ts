import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
  try {
    // Simple test - just return basic data
    return {
      message: 'Test page works',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Test page error:', error);
    return {
      message: 'Test failed',
      error: error.message
    };
  }
};