// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const en_condition_good = /** @type {(inputs: {}) => string} */ () => {
	return `Good`
};

const bg_condition_good = /** @type {(inputs: {}) => string} */ () => {
	return `Добър`
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
export const condition_good = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.condition_good(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("condition_good", locale)
	if (locale === "en") return en_condition_good(inputs)
	return bg_condition_good(inputs)
};