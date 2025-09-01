import type { PageLoad } from './$types';

// Configure page options for optimal performance
export const prerender = false; // Dynamic content based on user location and real-time data
export const ssr = true; // Enable SSR for SEO and fast initial load
export const csr = true; // Enable client-side rendering for smooth navigation

export const load = (async ({ data }) => {
  // Pass through server data to the page component
  return data;
}) satisfies PageLoad;