// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_onboarding_trending = /** @type {(inputs: {}) => string} */ () => {
	return `В тенденция`
};

const en_onboarding_trending = /** @type {(inputs: {}) => string} */ () => {
	return `Trending`
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
export const onboarding_trending = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.onboarding_trending(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("onboarding_trending", locale)
	if (locale === "bg") return bg_onboarding_trending(inputs)
	return en_onboarding_trending(inputs)
};