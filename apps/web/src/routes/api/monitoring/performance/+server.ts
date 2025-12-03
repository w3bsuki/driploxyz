import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { applySecurityConfig, addSecurityHeaders } from '$lib/server/middleware/security.js';
import { handleError } from '$lib/server/middleware/error-handler.js';
import { performanceMonitor } from '$lib/server/monitoring/performance.js';
import { dev } from '$app/environment';

// In-memory storage for Web Vitals from clients (server-side)
const webVitalsStore: Array<{
  name: string;
  value: number;
  rating: string;
  id: string;
  page: string;
  timestamp: number;
  userAgent: string;
}> = [];
const MAX_STORED_VITALS = 1000;

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
      case 'webvitals':
        data = getWebVitalsInsights();
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

/**
 * Get insights from stored Web Vitals
 */
function getWebVitalsInsights() {
  if (webVitalsStore.length === 0) {
    return { message: 'No Web Vitals data available yet' };
  }

  const now = Date.now();
  const lastHour = now - (60 * 60 * 1000);
  const recentVitals = webVitalsStore.filter(v => v.timestamp > lastHour);

  // Calculate averages by metric type
  const metricStats: Record<string, { values: number[]; ratings: Record<string, number> }> = {};
  
  recentVitals.forEach(vital => {
    if (!metricStats[vital.name]) {
      metricStats[vital.name] = { values: [], ratings: { good: 0, 'needs-improvement': 0, poor: 0 } };
    }
    metricStats[vital.name].values.push(vital.value);
    metricStats[vital.name].ratings[vital.rating] = (metricStats[vital.name].ratings[vital.rating] || 0) + 1;
  });

  const summary: Record<string, { avg: number; p75: number; p95: number; count: number; ratingBreakdown: Record<string, number> }> = {};
  
  Object.entries(metricStats).forEach(([name, stats]) => {
    const sorted = stats.values.sort((a, b) => a - b);
    const count = sorted.length;
    summary[name] = {
      avg: Math.round(sorted.reduce((a, b) => a + b, 0) / count * 100) / 100,
      p75: sorted[Math.floor(count * 0.75)] || 0,
      p95: sorted[Math.floor(count * 0.95)] || 0,
      count,
      ratingBreakdown: stats.ratings
    };
  });

  return {
    period: 'last_hour',
    totalSamples: recentVitals.length,
    metrics: summary,
    topPages: getTopPagesByVitals(recentVitals)
  };
}

function getTopPagesByVitals(vitals: typeof webVitalsStore) {
  const pageStats: Record<string, { count: number; avgLCP?: number }> = {};
  
  vitals.forEach(v => {
    if (!pageStats[v.page]) {
      pageStats[v.page] = { count: 0 };
    }
    pageStats[v.page].count++;
  });
  
  return Object.entries(pageStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([page, stats]) => ({ page, ...stats }));
}

/**
 * POST handler for receiving Web Vitals metrics from client
 * Phase 4: Performance Optimization - Core Web Vitals monitoring
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse the Web Vitals data
    const body = await request.json();
    
    const { name, value, rating, id, page, timestamp } = body;
    
    // Validate required fields
    if (!name || typeof value !== 'number') {
      return addSecurityHeaders(json(
        { error: 'Invalid Web Vitals data: name and value are required' },
        { status: 400 }
      ));
    }
    
    // Create the metric record
    const metric = {
      name,
      value,
      rating: rating || getRating(name, value),
      id: id || crypto.randomUUID(),
      page: page || '/',
      timestamp: timestamp || Date.now(),
      userAgent: request.headers.get('user-agent') || 'unknown'
    };
    
    // Store the metric
    webVitalsStore.push(metric);
    
    // Trim old entries if we exceed max
    if (webVitalsStore.length > MAX_STORED_VITALS) {
      webVitalsStore.shift();
    }
    
    // Log in development
    if (dev) {
      console.log(`[Web Vitals] ${metric.name}: ${metric.value} (${metric.rating}) - ${metric.page}`);
    }
    
    // Return success response
    const response = json({ 
      success: true,
      recorded: metric.name
    });
    
    return addSecurityHeaders(response);
    
  } catch {
    // Don't expose internal errors, just acknowledge receipt
    return addSecurityHeaders(json({ success: true }));
  }
};

// Helper function to determine rating based on thresholds
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; poor: number }> = {
    LCP: { good: 2500, poor: 4000 },
    CLS: { good: 0.1, poor: 0.25 },
    INP: { good: 200, poor: 500 },
    TTFB: { good: 800, poor: 1800 },
    FCP: { good: 1800, poor: 3000 }
  };
  
  const threshold = thresholds[name];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}
