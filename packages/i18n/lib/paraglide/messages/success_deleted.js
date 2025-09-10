// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_success_deleted = /** @type {(inputs: {}) => string} */ () => {
	return `Изтрито успешно`
};

const en_success_deleted = /** @type {(inputs: {}) => string} */ () => {
	return `Deleted successfully`
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
export const success_deleted = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.success_deleted(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("success_deleted", locale)
	if (locale === "bg") return bg_success_deleted(inputs)
	return en_success_deleted(inputs)
};