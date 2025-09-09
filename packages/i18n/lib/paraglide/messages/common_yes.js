// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_common_yes = /** @type {(inputs: {}) => string} */ () => {
	return `Yes`
};

const bg_common_yes = /** @type {(inputs: {}) => string} */ () => {
	return `Да`
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
export const common_yes = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.common_yes(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("common_yes", locale)
	if (locale === "en") return en_common_yes(inputs)
	return bg_common_yes(inputs)
};