// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_common_save = /** @type {(inputs: {}) => string} */ () => {
	return `Запази`
};

const en_common_save = /** @type {(inputs: {}) => string} */ () => {
	return `Save`
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
export const common_save = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.common_save(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("common_save", locale)
	if (locale === "bg") return bg_common_save(inputs)
	return en_common_save(inputs)
};