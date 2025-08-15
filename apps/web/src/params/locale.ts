import type { ParamMatcher } from '@sveltejs/kit';
import { isAvailableLanguageTag } from '@repo/i18n';

export const match: ParamMatcher = (param) => {
  return isAvailableLanguageTag(param);
};