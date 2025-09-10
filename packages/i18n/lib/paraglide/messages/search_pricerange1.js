// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_search_pricerange1 = /** @type {(inputs: {}) => string} */ () => {
	return `Ценови диапазон`
};

const en_search_pricerange1 = /** @type {(inputs: {}) => string} */ () => {
	return `Price Range`
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
const search_pricerange1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.search_pricerange1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("search_pricerange1", locale)
	if (locale === "bg") return bg_search_pricerange1(inputs)
	return en_search_pricerange1(inputs)
};
export { search_pricerange1 as "search_priceRange" }