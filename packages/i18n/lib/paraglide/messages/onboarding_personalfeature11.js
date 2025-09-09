// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_onboarding_personalfeature11 = /** @type {(inputs: {}) => string} */ () => {
	return `List up to 50 items`
};

const bg_onboarding_personalfeature11 = /** @type {(inputs: {}) => string} */ () => {
	return `Публикувай неограничен брой артикули`
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
const onboarding_personalfeature11 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_personalfeature11(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_personalfeature11", locale)
	if (locale === "en") return en_onboarding_personalfeature11(inputs)
	return bg_onboarding_personalfeature11(inputs)
};
export { onboarding_personalfeature11 as "onboarding_personalFeature1" }