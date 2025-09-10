// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_seller_profile = /** @type {(inputs: {}) => string} */ () => {
	return `Виж профил`
};

const en_seller_profile = /** @type {(inputs: {}) => string} */ () => {
	return `View Profile`
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
export const seller_profile = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.seller_profile(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("seller_profile", locale)
	if (locale === "bg") return bg_seller_profile(inputs)
	return en_seller_profile(inputs)
};