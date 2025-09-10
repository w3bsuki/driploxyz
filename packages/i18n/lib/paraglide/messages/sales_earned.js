// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_sales_earned = /** @type {(inputs: {}) => string} */ () => {
	return `спечелени`
};

const en_sales_earned = /** @type {(inputs: {}) => string} */ () => {
	return `earned`
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
export const sales_earned = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.sales_earned(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("sales_earned", locale)
	if (locale === "bg") return bg_sales_earned(inputs)
	return en_sales_earned(inputs)
};