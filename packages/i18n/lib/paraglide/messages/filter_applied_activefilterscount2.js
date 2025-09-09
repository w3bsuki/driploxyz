// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_filter_applied_activefilterscount2 = /** @type {(inputs: { count: NonNullable<unknown> }) => string} */ (i) => {
	return `${i.count} active filters`
};

const bg_filter_applied_activefilterscount2 = /** @type {(inputs: { count: NonNullable<unknown> }) => string} */ (i) => {
	return `${i.count} активни филтри`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{ count: NonNullable<unknown> }} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
const filter_applied_activefilterscount2 = (inputs, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.filter_applied_activefilterscount2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("filter_applied_activefilterscount2", locale)
	if (locale === "en") return en_filter_applied_activefilterscount2(inputs)
	return bg_filter_applied_activefilterscount2(inputs)
};
export { filter_applied_activefilterscount2 as "filter_applied_activeFiltersCount" }