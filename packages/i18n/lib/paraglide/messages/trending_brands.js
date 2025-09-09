// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_trending_brands = /** @type {(inputs: {}) => string} */ () => {
	return `Popular Brands`
};

const bg_trending_brands = /** @type {(inputs: {}) => string} */ () => {
	return `Популярни марки`
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
export const trending_brands = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.trending_brands(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("trending_brands", locale)
	if (locale === "en") return en_trending_brands(inputs)
	return bg_trending_brands(inputs)
};