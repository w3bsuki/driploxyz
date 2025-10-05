import type { PageLoad } from './$types';

// Prerender static content page - no serverless function needed
export const prerender = true;

export const load = (async () => {
  return {};
}) satisfies PageLoad;