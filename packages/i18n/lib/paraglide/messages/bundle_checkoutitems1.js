// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_bundle_checkoutitems1 = /** @type {(inputs: {}) => string} */ () => {
	return `Checkout`
};

const bg_bundle_checkoutitems1 = /** @type {(inputs: {}) => string} */ () => {
	return `Купете`
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
const bundle_checkoutitems1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.bundle_checkoutitems1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("bundle_checkoutitems1", locale)
	if (locale === "en") return en_bundle_checkoutitems1(inputs)
	return bg_bundle_checkoutitems1(inputs)
};
export { bundle_checkoutitems1 as "bundle_checkoutItems" }