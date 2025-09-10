// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_checkout_subtotal = /** @type {(inputs: {}) => string} */ () => {
	return `Междинна сума`
};

const en_checkout_subtotal = /** @type {(inputs: {}) => string} */ () => {
	return `Subtotal`
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
export const checkout_subtotal = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.checkout_subtotal(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("checkout_subtotal", locale)
	if (locale === "bg") return bg_checkout_subtotal(inputs)
	return en_checkout_subtotal(inputs)
};