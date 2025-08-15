import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ cookies, request }) => {
  const allCookies = cookies.getAll();
  
  return json({
    timestamp: new Date().toISOString(),
    user_agent: request.headers.get('user-agent')?.substring(0, 100),
    cookie_count: allCookies.length,
    cookies: allCookies.map(c => ({
      name: c.name,
      has_value: !!c.value,
      length: c.value?.length || 0,
      // Only show first few chars for security
      preview: c.value ? c.value.substring(0, 20) + '...' : null
    })),
    supabase_cookies: allCookies
      .filter(c => c.name.includes('sb-'))
      .map(c => c.name)
  });
};