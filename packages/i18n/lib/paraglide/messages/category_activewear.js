// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_category_activewear = /** @type {(inputs: {}) => string} */ () => {
	return `Спортно облекло`
};

const en_category_activewear = /** @type {(inputs: {}) => string} */ () => {
	return `Activewear`
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
export const category_activewear = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.category_activewear(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("category_activewear", locale)
	if (locale === "bg") return bg_category_activewear(inputs)
	return en_category_activewear(inputs)
};