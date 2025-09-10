// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_error_validation = /** @type {(inputs: {}) => string} */ () => {
	return `Моля проверете въведената информация`
};

const en_error_validation = /** @type {(inputs: {}) => string} */ () => {
	return `Please check your input`
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
export const error_validation = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.error_validation(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("error_validation", locale)
	if (locale === "bg") return bg_error_validation(inputs)
	return en_error_validation(inputs)
};