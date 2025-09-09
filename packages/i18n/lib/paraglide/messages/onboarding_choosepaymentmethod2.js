// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_onboarding_choosepaymentmethod2 = /** @type {(inputs: {}) => string} */ () => {
	return `Choose how you'll receive payments from sales`
};

const bg_onboarding_choosepaymentmethod2 = /** @type {(inputs: {}) => string} */ () => {
	return `Изберете как ще получавате плащания от продажби`
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
const onboarding_choosepaymentmethod2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_choosepaymentmethod2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_choosepaymentmethod2", locale)
	if (locale === "en") return en_onboarding_choosepaymentmethod2(inputs)
	return bg_onboarding_choosepaymentmethod2(inputs)
};
export { onboarding_choosepaymentmethod2 as "onboarding_choosePaymentMethod" }