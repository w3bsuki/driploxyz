import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { applySecurityConfig, addSecurityHeaders } from '$lib/server/middleware/security.js';
import { handleError } from '$lib/server/middleware/error-handler.js';
import { performanceMonitor } from '$lib/server/monitoring/performance.js';

export const GET: RequestHandler = async ({ request }) => {
  try {
    // Apply security middleware - admin only
    const securityResult = await applySecurityConfig(request, 'admin');
    if (securityResult instanceof Response) {
      return securityResult;
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'summary';

    let data;
    switch (type) {
      case 'summary':
        data = performanceMonitor.getPerformanceSummary();
        break;
      case 'database':
        data = performanceMonitor.getDatabaseInsights();
        break;
      case 'api':
        data = performanceMonitor.getAPIInsights();
        break;
      default:
        return addSecurityHeaders(new Response(
          JSON.stringify({ error: 'Invalid type parameter' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        ));
    }

    const response = json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });

    return addSecurityHeaders(response);

  } catch (error) {
    return addSecurityHeaders(handleError(error as Error, request));
  }
};
