// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_pagination_results = /** @type {(inputs: {}) => string} */ () => {
	return `results`
};

const bg_pagination_results = /** @type {(inputs: {}) => string} */ () => {
	return `резултати`
};

/**
* This function has been compiled by [Paraglide JS](https://inlang.com/m/gerre34r).
*
* - Changing this function will be over-written by the next build.
*
* - If you want to change the translations, you can either edit the source files e.g. `en.json`, or
* use another inlang app like [Fink](https://inlang.com/m/tdozzpar) or the [VSCode extension Sherlock](https://inlang.com/m/r7kp499g).
* 
* @param {{}} inputs
* @param {{ locale?: "en" | "bg" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
export const pagination_results = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.pagination_results(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("pagination_results", locale)
	if (locale === "en") return en_pagination_results(inputs)
	return bg_pagination_results(inputs)
};