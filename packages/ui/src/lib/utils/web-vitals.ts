/**
 * Core Web Vitals tracking utility
 * Monitors LCP, FID, CLS, FCP, and TTFB metrics
 */

interface Metric {
	name: string;
	value: number;
	rating: 'good' | 'needs-improvement' | 'poor';
	delta: number;
}

type MetricCallback = (metric: Metric) => void;

class WebVitalsTracker {
	private callbacks: Set<MetricCallback> = new Set();
	private metrics: Map<string, Metric> = new Map();
	
	constructor() {
		if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
			this.initializeObservers();
		}
	}
	
	private initializeObservers() {
		// Largest Contentful Paint (LCP)
		this.observeLCP();
		
		// First Input Delay (FID) 
		this.observeFID();
		
		// Cumulative Layout Shift (CLS)
		this.observeCLS();
		
		// First Contentful Paint (FCP)
		this.observeFCP();
		
		// Time to First Byte (TTFB)
		this.observeTTFB();
	}
	
	private observeLCP() {
		try {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const lastEntry = entries[entries.length - 1] as any;
				
				const metric: Metric = {
					name: 'LCP',
					value: lastEntry.renderTime || lastEntry.loadTime,
					rating: this.rateLCP(lastEntry.renderTime || lastEntry.loadTime),
					delta: 0
				};
				
				this.reportMetric(metric);
			});
			
			observer.observe({ type: 'largest-contentful-paint', buffered: true });
		} catch (e) {
			// LCP not supported
		}
	}
	
	private observeFID() {
		try {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const firstInput = entries[0] as any;
				
				const metric: Metric = {
					name: 'FID',
					value: firstInput.processingStart - firstInput.startTime,
					rating: this.rateFID(firstInput.processingStart - firstInput.startTime),
					delta: 0
				};
				
				this.reportMetric(metric);
			});
			
			observer.observe({ type: 'first-input', buffered: true });
		} catch (e) {
			// FID not supported
		}
	}
	
	private observeCLS() {
		let clsValue = 0;
		let clsEntries: any[] = [];
		
		try {
			const observer = new PerformanceObserver((list) => {
				for (const entry of list.getEntries() as any[]) {
					if (!entry.hadRecentInput) {
						clsValue += entry.value;
						clsEntries.push(entry);
					}
				}
				
				const metric: Metric = {
					name: 'CLS',
					value: clsValue,
					rating: this.rateCLS(clsValue),
					delta: 0
				};
				
				this.reportMetric(metric);
			});
			
			observer.observe({ type: 'layout-shift', buffered: true });
		} catch (e) {
			// CLS not supported
		}
	}
	
	private observeFCP() {
		try {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint') as any;
				
				if (fcpEntry) {
					const metric: Metric = {
						name: 'FCP',
						value: fcpEntry.startTime,
						rating: this.rateFCP(fcpEntry.startTime),
						delta: 0
					};
					
					this.reportMetric(metric);
				}
			});
			
			observer.observe({ type: 'paint', buffered: true });
		} catch (e) {
			// FCP not supported
		}
	}
	
	private observeTTFB() {
		try {
			const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
			
			if (navigationEntry) {
				const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
				
				const metric: Metric = {
					name: 'TTFB',
					value: ttfb,
					rating: this.rateTTFB(ttfb),
					delta: 0
				};
				
				this.reportMetric(metric);
			}
		} catch (e) {
			// TTFB not supported
		}
	}
	
	private rateLCP(value: number): 'good' | 'needs-improvement' | 'poor' {
		if (value <= 2500) return 'good';
		if (value <= 4000) return 'needs-improvement';
		return 'poor';
	}
	
	private rateFID(value: number): 'good' | 'needs-improvement' | 'poor' {
		if (value <= 100) return 'good';
		if (value <= 300) return 'needs-improvement';
		return 'poor';
	}
	
	private rateCLS(value: number): 'good' | 'needs-improvement' | 'poor' {
		if (value <= 0.1) return 'good';
		if (value <= 0.25) return 'needs-improvement';
		return 'poor';
	}
	
	private rateFCP(value: number): 'good' | 'needs-improvement' | 'poor' {
		if (value <= 1800) return 'good';
		if (value <= 3000) return 'needs-improvement';
		return 'poor';
	}
	
	private rateTTFB(value: number): 'good' | 'needs-improvement' | 'poor' {
		if (value <= 800) return 'good';
		if (value <= 1800) return 'needs-improvement';
		return 'poor';
	}
	
	private reportMetric(metric: Metric) {
		this.metrics.set(metric.name, metric);
		this.callbacks.forEach(callback => callback(metric));
		
		// Log to console in development
		if (import.meta.env.DEV) {
			console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
		}
	}
	
	public onMetric(callback: MetricCallback) {
		this.callbacks.add(callback);
		
		// Report existing metrics
		this.metrics.forEach(metric => callback(metric));
		
		return () => {
			this.callbacks.delete(callback);
		};
	}
	
	public getMetrics() {
		return Array.from(this.metrics.values());
	}
	
	public sendToAnalytics(endpoint?: string) {
		const metrics = this.getMetrics();
		
		if (metrics.length === 0) return;
		
		// Send to custom endpoint if provided
		if (endpoint) {
			fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ metrics, timestamp: Date.now() })
			}).catch(() => {
				// Silently fail
			});
		}
		
		// Send to Google Analytics if available
		if (typeof window !== 'undefined' && (window as any).gtag) {
			metrics.forEach(metric => {
				(window as any).gtag('event', metric.name, {
					value: Math.round(metric.value),
					metric_rating: metric.rating,
					non_interaction: true
				});
			});
		}
	}
}

// Export singleton instance
export const webVitals = new WebVitalsTracker();

// Export types
export type { Metric, MetricCallback };