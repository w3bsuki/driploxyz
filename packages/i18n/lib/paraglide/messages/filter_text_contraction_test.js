// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_filter_text_contraction_test = /** @type {(inputs: {}) => string} */ () => {
	return `Кратко`
};

const en_filter_text_contraction_test = /** @type {(inputs: {}) => string} */ () => {
	return `Short`
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
export const filter_text_contraction_test = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.filter_text_contraction_test(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("filter_text_contraction_test", locale)
	if (locale === "bg") return bg_filter_text_contraction_test(inputs)
	return en_filter_text_contraction_test(inputs)
};