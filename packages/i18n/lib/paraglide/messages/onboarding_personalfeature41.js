// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_onboarding_personalfeature41 = /** @type {(inputs: {}) => string} */ () => {
	return `Сигурни плащания`
};

const en_onboarding_personalfeature41 = /** @type {(inputs: {}) => string} */ () => {
	return `Community access`
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
const onboarding_personalfeature41 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_personalfeature41(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_personalfeature41", locale)
	if (locale === "bg") return bg_onboarding_personalfeature41(inputs)
	return en_onboarding_personalfeature41(inputs)
};
export { onboarding_personalfeature41 as "onboarding_personalFeature4" }