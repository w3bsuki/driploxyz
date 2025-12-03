/**
 * Web Vitals monitoring and reporting utility
 * Phase 4: Performance Optimization - Core Web Vitals
 * 
 * Targets (per Google's Core Web Vitals):
 * - LCP (Largest Contentful Paint): < 2.5s (good), < 4.0s (needs improvement)
 * - CLS (Cumulative Layout Shift): < 0.1 (good), < 0.25 (needs improvement)
 * - INP (Interaction to Next Paint): < 200ms (good), < 500ms (needs improvement)
 * - TTFB (Time to First Byte): < 800ms (good), < 1800ms (needs improvement)
 * - FCP (First Contentful Paint): < 1.8s (good), < 3.0s (needs improvement)
 * 
 * Note: FID (First Input Delay) was deprecated in March 2024 and replaced by INP
 */

import { browser } from '$app/environment';

export type WebVitalsName = 'LCP' | 'CLS' | 'INP' | 'TTFB' | 'FCP';

export interface WebVitalsMetric {
	name: WebVitalsName;
	value: number;
	rating: 'good' | 'needs-improvement' | 'poor';
	delta: number;
	id: string;
	navigationType: string;
	entries: PerformanceEntry[];
}

export interface WebVitalsReportHandler {
	(metric: WebVitalsMetric): void;
}

// Thresholds per Google Web Vitals guidelines (as of 2024)
const THRESHOLDS: Record<WebVitalsName, { good: number; poor: number }> = {
	LCP: { good: 2500, poor: 4000 },
	CLS: { good: 0.1, poor: 0.25 },
	INP: { good: 200, poor: 500 },
	TTFB: { good: 800, poor: 1800 },
	FCP: { good: 1800, poor: 3000 }
};

function getRating(name: WebVitalsName, value: number): 'good' | 'needs-improvement' | 'poor' {
	const threshold = THRESHOLDS[name];
	if (!threshold) return 'good';
	if (value <= threshold.good) return 'good';
	if (value <= threshold.poor) return 'needs-improvement';
	return 'poor';
}

/**
 * Initialize Web Vitals monitoring
 * Call this in the root layout component on mount
 */
export async function initWebVitals(reportHandler?: WebVitalsReportHandler): Promise<void> {
	if (!browser) return;

	// Dynamic import web-vitals for tree-shaking
	const { onLCP, onCLS, onINP, onTTFB, onFCP } = await import('web-vitals');
	
	const handler: WebVitalsReportHandler = reportHandler || defaultReportHandler;
	
	// Report all Core Web Vitals (FID was deprecated in 2024, replaced by INP)
	onLCP((metric) => handler(transformMetric('LCP', metric)));
	onCLS((metric) => handler(transformMetric('CLS', metric)));
	onINP((metric) => handler(transformMetric('INP', metric)));
	onTTFB((metric) => handler(transformMetric('TTFB', metric)));
	onFCP((metric) => handler(transformMetric('FCP', metric)));
}

interface RawMetric {
	value: number;
	delta: number;
	id: string;
	navigationType: string;
	entries: PerformanceEntry[];
}

function transformMetric(name: WebVitalsName, metric: RawMetric): WebVitalsMetric {
	return {
		name,
		value: metric.value,
		rating: getRating(name, metric.value),
		delta: metric.delta,
		id: metric.id,
		navigationType: metric.navigationType,
		entries: metric.entries || []
	};
}

/**
 * Default handler: logs to console in development, sends to analytics in production
 */
function defaultReportHandler(metric: WebVitalsMetric): void {
	const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
	
	if (isDev) {
		// Detailed console output for development
		const ratingEmoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
		console.log(
			`${ratingEmoji} [Web Vitals] ${metric.name}: ${metric.value.toFixed(metric.name === 'CLS' ? 3 : 0)}ms (${metric.rating})`
		);
		
		// Warn about poor metrics
		if (metric.rating === 'poor') {
			console.warn(`[Web Vitals] ${metric.name} is poor! Value: ${metric.value}, Threshold: ${THRESHOLDS[metric.name]?.poor}`);
		}
	} else {
		// Production: send to Vercel Analytics
		sendToAnalytics(metric);
	}
}

/**
 * Send Web Vitals to Vercel Analytics
 * https://vercel.com/docs/speed-insights
 */
function sendToAnalytics(metric: WebVitalsMetric): void {
	// Use Vercel's Web Analytics if available
	if (typeof (window as any).va === 'function') {
		(window as any).va('event', {
			name: 'Web Vitals',
			metric: metric.name,
			value: metric.value,
			rating: metric.rating
		});
	}
	
	// Also send to our custom monitoring endpoint
	if (navigator.sendBeacon) {
		const body = JSON.stringify({
			name: metric.name,
			value: metric.value,
			rating: metric.rating,
			id: metric.id,
			page: window.location.pathname,
			timestamp: Date.now()
		});
		
		navigator.sendBeacon('/api/monitoring/performance', body);
	}
}

/**
 * Report a custom performance metric
 */
export function reportCustomMetric(name: string, value: number, additionalData?: Record<string, unknown>): void {
	if (!browser) return;
	
	const isDev = window.location.hostname === 'localhost';
	
	if (isDev) {
		console.log(`[Custom Metric] ${name}: ${value}`, additionalData);
	}
	
	// Send to analytics in production
	if (!isDev && navigator.sendBeacon) {
		const body = JSON.stringify({
			name,
			value,
			...additionalData,
			page: window.location.pathname,
			timestamp: Date.now()
		});
		
		navigator.sendBeacon('/api/monitoring/performance', body);
	}
}

/**
 * Measure component render time
 * Usage: const endMeasure = measureRender('ProductCard'); ... endMeasure();
 */
export function measureRender(componentName: string): () => void {
	if (!browser) return () => {};
	
	const startTime = performance.now();
	
	return () => {
		const duration = performance.now() - startTime;
		reportCustomMetric(`render:${componentName}`, duration);
	};
}

/**
 * Measure async operation time
 * Usage: const duration = await measureAsync('api:products', fetchProducts);
 */
export async function measureAsync<T>(name: string, operation: () => Promise<T>): Promise<T> {
	const startTime = performance.now();
	
	try {
		const result = await operation();
		const duration = performance.now() - startTime;
		reportCustomMetric(name, duration, { status: 'success' });
		return result;
	} catch (error) {
		const duration = performance.now() - startTime;
		reportCustomMetric(name, duration, { status: 'error', error: String(error) });
		throw error;
	}
}

/**
 * Get current performance summary
 */
export function getPerformanceSummary(): Record<string, number> {
	if (!browser) return {};
	
	const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
	const paint = performance.getEntriesByType('paint');
	
	const summary: Record<string, number> = {};
	
	if (navigation) {
		summary.ttfb = navigation.responseStart - navigation.requestStart;
		summary.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.startTime;
		summary.load = navigation.loadEventEnd - navigation.startTime;
		summary.domInteractive = navigation.domInteractive - navigation.startTime;
	}
	
	paint.forEach((entry) => {
		if (entry.name === 'first-paint') {
			summary.fp = entry.startTime;
		}
		if (entry.name === 'first-contentful-paint') {
			summary.fcp = entry.startTime;
		}
	});
	
	return summary;
}
