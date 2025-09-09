// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_product_condition = /** @type {(inputs: {}) => string} */ () => {
	return `Condition`
};

const bg_product_condition = /** @type {(inputs: {}) => string} */ () => {
	return `Състояние`
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
export const product_condition = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.product_condition(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("product_condition", locale)
	if (locale === "en") return en_product_condition(inputs)
	return bg_product_condition(inputs)
};