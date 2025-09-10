// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_common_no = /** @type {(inputs: {}) => string} */ () => {
	return `Не`
};

const en_common_no = /** @type {(inputs: {}) => string} */ () => {
	return `No`
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
export const common_no = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.common_no(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("common_no", locale)
	if (locale === "bg") return bg_common_no(inputs)
	return en_common_no(inputs)
};