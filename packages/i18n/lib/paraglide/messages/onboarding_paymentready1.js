// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_onboarding_paymentready1 = /** @type {(inputs: {}) => string} */ () => {
	return `Payment Ready`
};

const bg_onboarding_paymentready1 = /** @type {(inputs: {}) => string} */ () => {
	return `Плащането е готово`
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
const onboarding_paymentready1 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_paymentready1(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_paymentready1", locale)
	if (locale === "en") return en_onboarding_paymentready1(inputs)
	return bg_onboarding_paymentready1(inputs)
};
export { onboarding_paymentready1 as "onboarding_paymentReady" }