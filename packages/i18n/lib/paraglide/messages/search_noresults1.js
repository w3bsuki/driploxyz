// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_search_noresults1 = /** @type {(inputs: {}) => string} */ () => {
	return `Няма намерени резултати`
};

const en_search_noresults1 = /** @type {(inputs: {}) => string} */ () => {
	return `No results found`
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
const search_noresults1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.search_noresults1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("search_noresults1", locale)
	if (locale === "bg") return bg_search_noresults1(inputs)
	return en_search_noresults1(inputs)
};
export { search_noresults1 as "search_noResults" }