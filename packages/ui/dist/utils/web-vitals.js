/**
 * Core Web Vitals tracking utility
 * Monitors LCP, FID, CLS, FCP, and TTFB metrics
 */
class WebVitalsTracker {
    constructor() {
        this.callbacks = new Set();
        this.metrics = new Map();
        if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
            this.initializeObservers();
        }
    }
    initializeObservers() {
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
    observeLCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                const metric = {
                    name: 'LCP',
                    value: lastEntry.renderTime || lastEntry.loadTime,
                    rating: this.rateLCP(lastEntry.renderTime || lastEntry.loadTime),
                    delta: 0
                };
                this.reportMetric(metric);
            });
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
        }
        catch (e) {
            // LCP not supported
        }
    }
    observeFID() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const firstInput = entries[0];
                const metric = {
                    name: 'FID',
                    value: firstInput.processingStart - firstInput.startTime,
                    rating: this.rateFID(firstInput.processingStart - firstInput.startTime),
                    delta: 0
                };
                this.reportMetric(metric);
            });
            observer.observe({ type: 'first-input', buffered: true });
        }
        catch (e) {
            // FID not supported
        }
    }
    observeCLS() {
        let clsValue = 0;
        let clsEntries = [];
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        clsEntries.push(entry);
                    }
                }
                const metric = {
                    name: 'CLS',
                    value: clsValue,
                    rating: this.rateCLS(clsValue),
                    delta: 0
                };
                this.reportMetric(metric);
            });
            observer.observe({ type: 'layout-shift', buffered: true });
        }
        catch (e) {
            // CLS not supported
        }
    }
    observeFCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
                if (fcpEntry) {
                    const metric = {
                        name: 'FCP',
                        value: fcpEntry.startTime,
                        rating: this.rateFCP(fcpEntry.startTime),
                        delta: 0
                    };
                    this.reportMetric(metric);
                }
            });
            observer.observe({ type: 'paint', buffered: true });
        }
        catch (e) {
            // FCP not supported
        }
    }
    observeTTFB() {
        try {
            const navigationEntry = performance.getEntriesByType('navigation')[0];
            if (navigationEntry) {
                const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
                const metric = {
                    name: 'TTFB',
                    value: ttfb,
                    rating: this.rateTTFB(ttfb),
                    delta: 0
                };
                this.reportMetric(metric);
            }
        }
        catch (e) {
            // TTFB not supported
        }
    }
    rateLCP(value) {
        if (value <= 2500)
            return 'good';
        if (value <= 4000)
            return 'needs-improvement';
        return 'poor';
    }
    rateFID(value) {
        if (value <= 100)
            return 'good';
        if (value <= 300)
            return 'needs-improvement';
        return 'poor';
    }
    rateCLS(value) {
        if (value <= 0.1)
            return 'good';
        if (value <= 0.25)
            return 'needs-improvement';
        return 'poor';
    }
    rateFCP(value) {
        if (value <= 1800)
            return 'good';
        if (value <= 3000)
            return 'needs-improvement';
        return 'poor';
    }
    rateTTFB(value) {
        if (value <= 800)
            return 'good';
        if (value <= 1800)
            return 'needs-improvement';
        return 'poor';
    }
    reportMetric(metric) {
        this.metrics.set(metric.name, metric);
        this.callbacks.forEach(callback => callback(metric));
        // Log to console in development
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
        }
    }
    onMetric(callback) {
        this.callbacks.add(callback);
        // Report existing metrics
        this.metrics.forEach(metric => callback(metric));
        return () => {
            this.callbacks.delete(callback);
        };
    }
    getMetrics() {
        return Array.from(this.metrics.values());
    }
    sendToAnalytics(endpoint) {
        const metrics = this.getMetrics();
        if (metrics.length === 0)
            return;
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
        if (typeof window !== 'undefined' && window.gtag) {
            metrics.forEach(metric => {
                window.gtag('event', metric.name, {
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
