// eslint-disable
import { getLocale, trackMessageCall, experimentalMiddlewareLocaleSplitting, isServer } from '../runtime.js';

const bg_filter_size = /** @type {(inputs: {}) => string} */ () => {
	return `Размер`
};

const en_filter_size = /** @type {(inputs: {}) => string} */ () => {
	return `Size`
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
export const filter_size = (inputs = {}, options = {}) => {
	if (experimentalMiddlewareLocaleSplitting && isServer === false) {
		return /** @type {any} */ (globalThis).__paraglide_ssr.filter_size(inputs) 
	}
	const locale = options.locale ?? getLocale()
	trackMessageCall("filter_size", locale)
	if (locale === "bg") return bg_filter_size(inputs)
	return en_filter_size(inputs)
};