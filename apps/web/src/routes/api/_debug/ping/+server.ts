import { json } from '@sveltejs/kit';
import { dev } from '$app/environment';

export const GET = async () => {
  if (!dev) {
    return new Response('Not found', { status: 404 });
  }

  return json({
    message: 'Debug endpoint is working',
    timestamp: new Date().toISOString(),
    environment: dev ? 'development' : 'production',
    nodeVersion: process.version,
    platform: process.platform
  });
};