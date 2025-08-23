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
declare class WebVitalsTracker {
    private callbacks;
    private metrics;
    constructor();
    private initializeObservers;
    private observeLCP;
    private observeFID;
    private observeCLS;
    private observeFCP;
    private observeTTFB;
    private rateLCP;
    private rateFID;
    private rateCLS;
    private rateFCP;
    private rateTTFB;
    private reportMetric;
    onMetric(callback: MetricCallback): () => void;
    getMetrics(): Metric[];
    sendToAnalytics(endpoint?: string): void;
}
export declare const webVitals: WebVitalsTracker;
export type { Metric, MetricCallback };
//# sourceMappingURL=web-vitals.d.ts.map