import type { LayoutServerLoad } from './$types';

export const load = (async () => {
  // API routes don't need auth protection - they handle it individually
  return {};
}) satisfies LayoutServerLoad;