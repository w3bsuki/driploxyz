// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_badge_new = /** @type {(inputs: {}) => string} */ () => {
	return `НОВ`
};

const en_badge_new = /** @type {(inputs: {}) => string} */ () => {
	return `NEW`
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
export const badge_new = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.badge_new(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("badge_new", locale)
	if (locale === "bg") return bg_badge_new(inputs)
	return en_badge_new(inputs)
};