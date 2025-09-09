// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_checkout_proceedtopayment2 = /** @type {(inputs: {}) => string} */ () => {
	return `Proceed to payment`
};

const bg_checkout_proceedtopayment2 = /** @type {(inputs: {}) => string} */ () => {
	return `Продължи към плащане`
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
const checkout_proceedtopayment2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.checkout_proceedtopayment2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("checkout_proceedtopayment2", locale)
	if (locale === "en") return en_checkout_proceedtopayment2(inputs)
	return bg_checkout_proceedtopayment2(inputs)
};
export { checkout_proceedtopayment2 as "checkout_proceedToPayment" }