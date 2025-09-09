// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_buyer_protection = /** @type {(inputs: {}) => string} */ () => {
	return `Buyer Protection`
};

/** @type {(inputs: {}) => string} */
const bg_buyer_protection = en_buyer_protection;

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
export const buyer_protection = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.buyer_protection(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("buyer_protection", locale)
	if (locale === "en") return en_buyer_protection(inputs)
	return bg_buyer_protection(inputs)
};