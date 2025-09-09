// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_seller_day = /** @type {(inputs: {}) => string} */ () => {
	return `day`
};

const bg_seller_day = /** @type {(inputs: {}) => string} */ () => {
	return `ден`
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
export const seller_day = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.seller_day(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("seller_day", locale)
	if (locale === "en") return en_seller_day(inputs)
	return bg_seller_day(inputs)
};