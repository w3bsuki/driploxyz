import type { ParamMatcher } from '@sveltejs/kit';
import { locales } from '@repo/i18n/paraglide/runtime';

export const match: ParamMatcher = (param) => {
  return locales.includes(param as (typeof locales)[number]);
};