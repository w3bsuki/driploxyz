// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_onboarding_gotodashboard2 = /** @type {(inputs: {}) => string} */ () => {
	return `Go to Dashboard & Subscribe`
};

const bg_onboarding_gotodashboard2 = /** @type {(inputs: {}) => string} */ () => {
	return `Идете в Dashboard & Абонирайте се`
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
const onboarding_gotodashboard2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_gotodashboard2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_gotodashboard2", locale)
	if (locale === "en") return en_onboarding_gotodashboard2(inputs)
	return bg_onboarding_gotodashboard2(inputs)
};
export { onboarding_gotodashboard2 as "onboarding_goToDashboard" }