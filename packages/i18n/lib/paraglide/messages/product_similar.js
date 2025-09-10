// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_product_similar = /** @type {(inputs: {}) => string} */ () => {
	return `Подобни артикули`
};

const en_product_similar = /** @type {(inputs: {}) => string} */ () => {
	return `Similar items`
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
export const product_similar = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.product_similar(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("product_similar", locale)
	if (locale === "bg") return bg_product_similar(inputs)
	return en_product_similar(inputs)
};