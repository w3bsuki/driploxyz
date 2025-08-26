import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Demo page is public - no auth needed
  return {
    title: 'Component Showcase'
  };
};