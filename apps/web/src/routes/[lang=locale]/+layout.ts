import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params }) => {
  // Language is already validated by param matcher
  return {
    lang: params.lang
  };
};