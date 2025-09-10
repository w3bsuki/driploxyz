// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_checkout_emailconfirmation1 = /** @type {(inputs: {}) => string} */ () => {
	return `Ще получите имейл потвърждение скоро с детайли за вашата поръчка.`
};

const en_checkout_emailconfirmation1 = /** @type {(inputs: {}) => string} */ () => {
	return `You'll receive an email confirmation shortly with your order details.`
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
const checkout_emailconfirmation1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.checkout_emailconfirmation1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("checkout_emailconfirmation1", locale)
	if (locale === "bg") return bg_checkout_emailconfirmation1(inputs)
	return en_checkout_emailconfirmation1(inputs)
};
export { checkout_emailconfirmation1 as "checkout_emailConfirmation" }