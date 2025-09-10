// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_search_allconditions1 = /** @type {(inputs: {}) => string} */ () => {
	return `Всички състояния`
};

const en_search_allconditions1 = /** @type {(inputs: {}) => string} */ () => {
	return `All Conditions`
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
const search_allconditions1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.search_allconditions1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("search_allconditions1", locale)
	if (locale === "bg") return bg_search_allconditions1(inputs)
	return en_search_allconditions1(inputs)
};
export { search_allconditions1 as "search_allConditions" }