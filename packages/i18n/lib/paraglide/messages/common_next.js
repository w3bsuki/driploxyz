// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_common_next = /** @type {(inputs: {}) => string} */ () => {
	return `Напред`
};

const en_common_next = /** @type {(inputs: {}) => string} */ () => {
	return `Next`
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
export const common_next = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.common_next(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("common_next", locale)
	if (locale === "bg") return bg_common_next(inputs)
	return en_common_next(inputs)
};