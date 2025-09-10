// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_search_cheapest = /** @type {(inputs: {}) => string} */ () => {
	return `Най-евтино`
};

const en_search_cheapest = /** @type {(inputs: {}) => string} */ () => {
	return `Cheapest`
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
* @param {{ locale?: "bg" | "en" }} options
* @returns {string}
*/
/* @__NO_SIDE_EFFECTS__ */
export const search_cheapest = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.search_cheapest(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("search_cheapest", locale)
	if (locale === "bg") return bg_search_cheapest(inputs)
	return en_search_cheapest(inputs)
};