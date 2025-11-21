// Lightweight analytics hook stub to satisfy imports and provide minimal types
export type AnalyticsEvent = string;
export type AnalyticsData = Record<string, unknown> | undefined;

export function useAnalytics() {
  function track(event: AnalyticsEvent, data?: AnalyticsData) {
    if (typeof window !== 'undefined') {
      // Replace with real analytics later
      // console.debug('[analytics]', event, data);
    }
  }
  // Backward-compat convenience used in a couple places
  function trackEmptyStateAction(action: string, mode: string, extra?: string) {
    track('empty_state_action', { action, mode, extra });
  }
  return { track, trackEmptyStateAction };
}
