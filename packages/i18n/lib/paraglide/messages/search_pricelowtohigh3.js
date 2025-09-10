// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_search_pricelowtohigh3 = /** @type {(inputs: {}) => string} */ () => {
	return `Цена ↑`
};

const en_search_pricelowtohigh3 = /** @type {(inputs: {}) => string} */ () => {
	return `Price: Low to High`
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
const search_pricelowtohigh3 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.search_pricelowtohigh3(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("search_pricelowtohigh3", locale)
	if (locale === "bg") return bg_search_pricelowtohigh3(inputs)
	return en_search_pricelowtohigh3(inputs)
};
export { search_pricelowtohigh3 as "search_priceLowToHigh" }