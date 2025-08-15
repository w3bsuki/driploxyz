import { json } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY } from '$env/static/private';

export function GET() {
  return json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      runtime: process.env.VERCEL_REGION || 'local',
      deployment_id: process.env.VERCEL_DEPLOYMENT_ID || 'local',
      has_public_supabase_url: !!PUBLIC_SUPABASE_URL,
      has_public_supabase_key: !!PUBLIC_SUPABASE_ANON_KEY,
      has_service_role_key: !!SUPABASE_SERVICE_ROLE_KEY,
      has_stripe_public_key: !!PUBLIC_STRIPE_PUBLISHABLE_KEY,
      has_stripe_secret_key: !!STRIPE_SECRET_KEY,
    },
    request_info: {
      vercel_id: process.env.VERCEL_REQUEST_ID || null,
      edge_region: process.env.VERCEL_EDGE_REGION || null,
    }
  });
}