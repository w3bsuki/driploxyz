// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_verified_brands = /** @type {(inputs: {}) => string} */ () => {
	return `Потвърдени марки`
};

const en_verified_brands = /** @type {(inputs: {}) => string} */ () => {
	return `Verified brands`
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
export const verified_brands = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.verified_brands(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("verified_brands", locale)
	if (locale === "bg") return bg_verified_brands(inputs)
	return en_verified_brands(inputs)
};