import type { ParamMatcher } from '@sveltejs/kit';
import * as i18n from '@repo/i18n';

export const match: ParamMatcher = (param) => {
  return i18n.locales.includes(param as i18n.Locale);
};