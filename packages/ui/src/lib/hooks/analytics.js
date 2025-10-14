// Lightweight analytics hook stub to satisfy imports
export function useAnalytics() {
  function track(event, data) {
    if (typeof window !== 'undefined') {
      // Replace with real analytics later
      // console.debug('[analytics]', event, data);
    }
  }
  return { track };
}
