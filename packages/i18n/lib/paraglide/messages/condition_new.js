// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_condition_new = /** @type {(inputs: {}) => string} */ () => {
	return `New`
};

const bg_condition_new = /** @type {(inputs: {}) => string} */ () => {
	return `Нов`
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
export const condition_new = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.condition_new(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("condition_new", locale)
	if (locale === "en") return en_condition_new(inputs)
	return bg_condition_new(inputs)
};