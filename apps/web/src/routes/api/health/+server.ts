import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

export function GET() {
  return json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      node_version: process.version,
      runtime: process.env.VERCEL_REGION || 'local',
      deployment_id: process.env.VERCEL_DEPLOYMENT_ID || 'local',
      has_public_supabase_url: !!env.PUBLIC_SUPABASE_URL,
      has_public_supabase_key: !!env.PUBLIC_SUPABASE_ANON_KEY,
      has_service_role_key: !!privateEnv.SUPABASE_SERVICE_ROLE_KEY,
      has_stripe_public_key: !!env.PUBLIC_STRIPE_PUBLISHABLE_KEY,
      has_stripe_secret_key: !!privateEnv.STRIPE_SECRET_KEY,
    },
    request_info: {
      vercel_id: process.env.VERCEL_REQUEST_ID || null,
      edge_region: process.env.VERCEL_EDGE_REGION || null,
    }
  });
}