// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_search_under25 = /** @type {(inputs: {}) => string} */ () => {
	return `Under $25`
};

const bg_search_under25 = /** @type {(inputs: {}) => string} */ () => {
	return `Под 25 лв`
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
export const search_under25 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.search_under25(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("search_under25", locale)
	if (locale === "en") return en_search_under25(inputs)
	return bg_search_under25(inputs)
};