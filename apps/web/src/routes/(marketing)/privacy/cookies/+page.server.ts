import type { PageServerLoad } from './$types';

export const load = (async ({ setHeaders }) => {
  // Optimize cache headers for static content pages - rarely changes, can be cached for long periods
  setHeaders({
    'cache-control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
    'vary': 'Accept-Encoding',
    'x-cache-strategy': 'static-content'
  });

  return {};
}) satisfies PageServerLoad;