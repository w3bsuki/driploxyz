// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_checkout_shippingaddress1 = /** @type {(inputs: {}) => string} */ () => {
	return `Адрес за доставка`
};

const en_checkout_shippingaddress1 = /** @type {(inputs: {}) => string} */ () => {
	return `Shipping address`
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
const checkout_shippingaddress1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.checkout_shippingaddress1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("checkout_shippingaddress1", locale)
	if (locale === "bg") return bg_checkout_shippingaddress1(inputs)
	return en_checkout_shippingaddress1(inputs)
};
export { checkout_shippingaddress1 as "checkout_shippingAddress" }