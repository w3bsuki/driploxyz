// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_category_shirts = /** @type {(inputs: {}) => string} */ () => {
	return `Shirts`
};

const bg_category_shirts = /** @type {(inputs: {}) => string} */ () => {
	return `Ризи`
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
export const category_shirts = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.category_shirts(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("category_shirts", locale)
	if (locale === "en") return en_category_shirts(inputs)
	return bg_category_shirts(inputs)
};