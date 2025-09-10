// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_onboarding_tellaboutyourself2 = /** @type {(inputs: {}) => string} */ () => {
	return `Разкажете ни малко за себе си`
};

const en_onboarding_tellaboutyourself2 = /** @type {(inputs: {}) => string} */ () => {
	return `Tell us a bit about yourself`
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
const onboarding_tellaboutyourself2 = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_tellaboutyourself2(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_tellaboutyourself2", locale)
	if (locale === "bg") return bg_onboarding_tellaboutyourself2(inputs)
	return en_onboarding_tellaboutyourself2(inputs)
};
export { onboarding_tellaboutyourself2 as "onboarding_tellAboutYourself" }