import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    // Get client IP address
    const clientIP = getClientAddress();

    // Get additional client info from headers
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';

    return json({
      ip: clientIP,
      userAgent: userAgent,
      acceptLanguage: acceptLanguage,
      timestamp: new Date().toISOString()
    });
  } catch {
    
    return json({
      ip: null,
      userAgent: '',
      acceptLanguage: '',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
};