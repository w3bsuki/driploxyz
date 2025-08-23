/**
 * Core Web Vitals tracking utility
 * Monitors LCP, FID, CLS, FCP, and TTFB metrics
 */
var WebVitalsTracker = /** @class */ (function () {
    function WebVitalsTracker() {
        this.callbacks = new Set();
        this.metrics = new Map();
        if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
            this.initializeObservers();
        }
    }
    WebVitalsTracker.prototype.initializeObservers = function () {
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
    };
    WebVitalsTracker.prototype.observeLCP = function () {
        var _this = this;
        try {
            var observer = new PerformanceObserver(function (list) {
                var entries = list.getEntries();
                var lastEntry = entries[entries.length - 1];
                var metric = {
                    name: 'LCP',
                    value: lastEntry.renderTime || lastEntry.loadTime,
                    rating: _this.rateLCP(lastEntry.renderTime || lastEntry.loadTime),
                    delta: 0
                };
                _this.reportMetric(metric);
            });
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
        }
        catch (e) {
            // LCP not supported
        }
    };
    WebVitalsTracker.prototype.observeFID = function () {
        var _this = this;
        try {
            var observer = new PerformanceObserver(function (list) {
                var entries = list.getEntries();
                var firstInput = entries[0];
                var metric = {
                    name: 'FID',
                    value: firstInput.processingStart - firstInput.startTime,
                    rating: _this.rateFID(firstInput.processingStart - firstInput.startTime),
                    delta: 0
                };
                _this.reportMetric(metric);
            });
            observer.observe({ type: 'first-input', buffered: true });
        }
        catch (e) {
            // FID not supported
        }
    };
    WebVitalsTracker.prototype.observeCLS = function () {
        var _this = this;
        var clsValue = 0;
        var clsEntries = [];
        try {
            var observer = new PerformanceObserver(function (list) {
                for (var _i = 0, _a = list.getEntries(); _i < _a.length; _i++) {
                    var entry = _a[_i];
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        clsEntries.push(entry);
                    }
                }
                var metric = {
                    name: 'CLS',
                    value: clsValue,
                    rating: _this.rateCLS(clsValue),
                    delta: 0
                };
                _this.reportMetric(metric);
            });
            observer.observe({ type: 'layout-shift', buffered: true });
        }
        catch (e) {
            // CLS not supported
        }
    };
    WebVitalsTracker.prototype.observeFCP = function () {
        var _this = this;
        try {
            var observer = new PerformanceObserver(function (list) {
                var entries = list.getEntries();
                var fcpEntry = entries.find(function (entry) { return entry.name === 'first-contentful-paint'; });
                if (fcpEntry) {
                    var metric = {
                        name: 'FCP',
                        value: fcpEntry.startTime,
                        rating: _this.rateFCP(fcpEntry.startTime),
                        delta: 0
                    };
                    _this.reportMetric(metric);
                }
            });
            observer.observe({ type: 'paint', buffered: true });
        }
        catch (e) {
            // FCP not supported
        }
    };
    WebVitalsTracker.prototype.observeTTFB = function () {
        try {
            var navigationEntry = performance.getEntriesByType('navigation')[0];
            if (navigationEntry) {
                var ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
                var metric = {
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
    };
    WebVitalsTracker.prototype.rateLCP = function (value) {
        if (value <= 2500)
            return 'good';
        if (value <= 4000)
            return 'needs-improvement';
        return 'poor';
    };
    WebVitalsTracker.prototype.rateFID = function (value) {
        if (value <= 100)
            return 'good';
        if (value <= 300)
            return 'needs-improvement';
        return 'poor';
    };
    WebVitalsTracker.prototype.rateCLS = function (value) {
        if (value <= 0.1)
            return 'good';
        if (value <= 0.25)
            return 'needs-improvement';
        return 'poor';
    };
    WebVitalsTracker.prototype.rateFCP = function (value) {
        if (value <= 1800)
            return 'good';
        if (value <= 3000)
            return 'needs-improvement';
        return 'poor';
    };
    WebVitalsTracker.prototype.rateTTFB = function (value) {
        if (value <= 800)
            return 'good';
        if (value <= 1800)
            return 'needs-improvement';
        return 'poor';
    };
    WebVitalsTracker.prototype.reportMetric = function (metric) {
        this.metrics.set(metric.name, metric);
        this.callbacks.forEach(function (callback) { return callback(metric); });
        // Log to console in development
        if (import.meta.env.DEV) {
            console.log("[Web Vitals] ".concat(metric.name, ": ").concat(metric.value.toFixed(2), "ms (").concat(metric.rating, ")"));
        }
    };
    WebVitalsTracker.prototype.onMetric = function (callback) {
        var _this = this;
        this.callbacks.add(callback);
        // Report existing metrics
        this.metrics.forEach(function (metric) { return callback(metric); });
        return function () {
            _this.callbacks.delete(callback);
        };
    };
    WebVitalsTracker.prototype.getMetrics = function () {
        return Array.from(this.metrics.values());
    };
    WebVitalsTracker.prototype.sendToAnalytics = function (endpoint) {
        var metrics = this.getMetrics();
        if (metrics.length === 0)
            return;
        // Send to custom endpoint if provided
        if (endpoint) {
            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ metrics: metrics, timestamp: Date.now() })
            }).catch(function () {
                // Silently fail
            });
        }
        // Send to Google Analytics if available
        if (typeof window !== 'undefined' && window.gtag) {
            metrics.forEach(function (metric) {
                window.gtag('event', metric.name, {
                    value: Math.round(metric.value),
                    metric_rating: metric.rating,
                    non_interaction: true
                });
            });
        }
    };
    return WebVitalsTracker;
}());
// Export singleton instance
export var webVitals = new WebVitalsTracker();
